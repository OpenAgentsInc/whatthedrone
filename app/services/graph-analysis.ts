import { LlamaContext } from "llama.rn"
import { Edge, GraphInsight, Node } from "../types/graph"

const ANALYSIS_SYSTEM_PROMPT = `You are analyzing a knowledge graph about drone activities.
Focus on finding non-obvious connections and patterns.
Think carefully and explain your reasoning step by step.
Format your response exactly as requested.`

export default class GraphAnalysisService {
  private context: LlamaContext
  private attempts: number
  private temperature: number
  private maxTokens: number
  private onLog: (message: string, nodeId?: string) => void

  constructor(
    context: LlamaContext,
    config: {
      attempts?: number
      temperature?: number
      maxTokens?: number
      onLog?: (message: string, nodeId?: string) => void
    } = {}
  ) {
    this.context = context
    this.attempts = config.attempts || 8
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 1000
    this.onLog = config.onLog || (() => {})
  }

  private formatGraphForLLM(nodes: Node[], edges: Edge[]): string {
    return `
Nodes:
${nodes.map(n => `- ${n.label} (${n.type}): ${n.metadata?.description || ''}`).join('\n')}

Connections:
${edges.map(e => {
      const from = nodes.find(n => n.id === e.from)
      const to = nodes.find(n => n.id === e.to)
      return `- ${from?.label} ${e.type} ${to?.label}`
    }).join('\n')}
`
  }

  private buildPrompt(
    graphContext: string,
    currentNode: Node | null,
    previousInsights: GraphInsight[]
  ): string {
    const nodeContext = currentNode 
      ? `\nCurrently focusing on node: ${currentNode.label} (${currentNode.type})`
      : '';

    return `${ANALYSIS_SYSTEM_PROMPT}

Graph context:
${graphContext}
${nodeContext}

Previous insights found:
${previousInsights.map(i => `- ${i.description}`).join('\n')}

Think step by step:
1. What entities are most connected?
2. Are there temporal patterns?
3. Are there geographic patterns?
4. What unusual connections stand out?
5. What might this suggest about drone activities?

Provide your insight in this format:
INSIGHT: [one sentence description]
REASONING: [numbered steps]
CONFIDENCE: [0-100]
NODES: [list of involved node IDs]
NEXT_NODE: [ID of next node to analyze or DONE if complete]
`
  }

  private parseInsightFromResponse(response: string): {
    insight: GraphInsight | null,
    nextNodeId: string | null
  } {
    console.log('Parsing response:', response)
    try {
      const insightMatch = response.match(/INSIGHT: (.+)/)
      const reasoningMatch = response.match(/REASONING: ([\\s\\S]+?)\\nCONFIDENCE:/)
      const confidenceMatch = response.match(/CONFIDENCE: (\\d+)/)
      const nodesMatch = response.match(/NODES: (.+)/)
      const nextNodeMatch = response.match(/NEXT_NODE: (.+)/)

      console.log('Matches:', {
        insight: insightMatch?.[1],
        reasoning: reasoningMatch?.[1],
        confidence: confidenceMatch?.[1],
        nodes: nodesMatch?.[1],
        nextNode: nextNodeMatch?.[1]
      })

      if (!insightMatch || !reasoningMatch || !confidenceMatch || !nodesMatch || !nextNodeMatch) {
        console.log('Failed to match all required fields')
        return { insight: null, nextNodeId: null }
      }

      const description = insightMatch[1].trim()
      const reasoning = reasoningMatch[1]
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      const confidence = parseInt(confidenceMatch[1])
      const nodes = nodesMatch[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      const nextNodeId = nextNodeMatch[1].trim()

      const insight = {
        description,
        reasoning,
        confidence,
        relatedNodes: nodes,
      }
      console.log('Parsed insight:', insight)
      console.log('Next node:', nextNodeId)

      return {
        insight,
        nextNodeId: nextNodeId === 'DONE' ? null : nextNodeId
      }
    } catch (e) {
      console.error('Failed to parse insight:', e)
      return { insight: null, nextNodeId: null }
    }
  }

  private async getCompletion(prompt: string): Promise<string> {
    console.log('Sending prompt:', prompt)
    return new Promise((resolve, reject) => {
      let response = ''

      this.context
        .completion(
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: this.temperature,
            n_predict: this.maxTokens,
          },
          (data) => {
            response += data.token
            console.log('Token received:', data.token)
          }
        )
        .then(() => {
          console.log('Full response:', response)
          resolve(response)
        })
        .catch(reject)
    })
  }

  private deduplicateInsights(insights: GraphInsight[]): GraphInsight[] {
    const seen = new Set<string>()
    return insights.filter(insight => {
      const key = insight.description.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  async analyzeGraph(
    nodes: Node[],
    edges: Edge[],
  ): Promise<GraphInsight[]> {
    console.log('Starting graph analysis with nodes:', nodes)
    console.log('and edges:', edges)

    const insights: GraphInsight[] = []
    const graphContext = this.formatGraphForLLM(nodes, edges)
    let currentNodeId: string | null = nodes[0]?.id || null
    let visitedNodes = new Set<string>()

    console.log('Initial graph context:', graphContext)
    this.onLog('Beginning graph analysis...')

    while (currentNodeId && visitedNodes.size < nodes.length) {
      const currentNode = nodes.find(n => n.id === currentNodeId)
      if (!currentNode) {
        console.log('Could not find node:', currentNodeId)
        break
      }

      console.log('Analyzing node:', currentNode)
      this.onLog(`Analyzing node: ${currentNode.label}`, currentNode.id)
      visitedNodes.add(currentNodeId)

      const prompt = this.buildPrompt(graphContext, currentNode, insights)
      console.log('Built prompt:', prompt)
      const response = await this.getCompletion(prompt)
      console.log('Got response:', response)
      
      const { insight, nextNodeId } = this.parseInsightFromResponse(response)
      console.log('Parsed result:', { insight, nextNodeId })
      
      if (insight && insight.confidence > 70) {
        console.log('Adding insight:', insight)
        this.onLog(`Found insight: ${insight.description}`)
        insights.push(insight)
      }

      currentNodeId = nextNodeId
      if (currentNodeId && visitedNodes.has(currentNodeId)) {
        console.log('Already visited node:', currentNodeId)
        // If we've seen this node before, pick a random unvisited node
        const unvisitedNodes = nodes.filter(n => !visitedNodes.has(n.id))
        console.log('Unvisited nodes:', unvisitedNodes)
        if (unvisitedNodes.length > 0) {
          currentNodeId = unvisitedNodes[0].id
          console.log('Picked new node:', currentNodeId)
        } else {
          console.log('No more nodes to visit')
          currentNodeId = null
        }
      }
    }

    console.log('Analysis complete with insights:', insights)
    this.onLog('Analysis complete!')
    return this.deduplicateInsights(insights)
  }
}