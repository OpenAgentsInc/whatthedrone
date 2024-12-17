import { LlamaContext } from "llama.rn"
import { Edge, GraphInsight, Node } from "../types/graph"

const ANALYSIS_SYSTEM_PROMPT = `You are analyzing a knowledge graph about drone activities.
Focus on finding non-obvious connections and patterns.
Think carefully and explain your reasoning step by step.
Format your response EXACTLY like this example:

INSIGHT: The connection between military bases and drone sightings suggests systematic surveillance
REASONING: 1. Multiple military bases report sightings
2. Pattern of activity near sensitive areas
3. Consistent timing and behavior
CONFIDENCE: 85
NODES: military-base-1, military-base-2, drone-sighting-1
NEXT_NODE: [Pick an actual node from the graph to analyze next, or write SYNTHESIZE if you've generated 3 insights]

Your response MUST contain all these sections with the exact labels.
After generating 3 insights, write SYNTHESIZE as the NEXT_NODE to create a higher-level insight.`

const SYNTHESIS_PROMPT = `You are synthesizing insights about drone activities.
Based on these previous insights, create a higher-level understanding.

Previous insights:
{insights}

Create a new, synthesized insight that combines and elevates these observations.
Format your response EXACTLY like this:

INSIGHT: [A higher-level insight that connects the patterns]
REASONING: 1. [First connection]
2. [Second connection]
3. [Higher-level implication]
CONFIDENCE: [0-100]
NODES: [All relevant nodes]
NEXT_NODE: DONE`

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

Remember to format your response EXACTLY as shown in the example above.
After 3 insights, write SYNTHESIZE as the NEXT_NODE value.
`
  }

  private buildSynthesisPrompt(insights: GraphInsight[]): string {
    const insightsText = insights.map((insight, i) => `
Insight ${i + 1}: ${insight.description}
Reasoning:
${insight.reasoning.join('\n')}
Confidence: ${insight.confidence}%
Related Nodes: ${insight.relatedNodes.join(', ')}
`).join('\n')

    return SYNTHESIS_PROMPT.replace('{insights}', insightsText)
  }

  private parseInsightFromResponse(response: string): {
    insight: GraphInsight | null,
    nextNodeId: string | null
  } {
    console.log('Parsing response:', response)
    try {
      const insightMatch = response.match(/INSIGHT:\s*(.+?)(?=\nREASONING:)/s)
      const reasoningMatch = response.match(/REASONING:\s*([\s\S]+?)(?=\nCONFIDENCE:)/s)
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/s)
      const nodesMatch = response.match(/NODES:\s*(.+?)(?=\nNEXT_NODE:)/s)
      const nextNodeMatch = response.match(/NEXT_NODE:\s*(.+?)(?=\n|$)/s)

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
        .split(/[,\s]+/)
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

  private getNextUnvisitedNode(nodes: Node[], visitedNodes: Set<string>): Node | null {
    const unvisited = nodes.filter(n => !visitedNodes.has(n.id))
    return unvisited.length > 0 ? unvisited[0] : null
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
    let insightCount = 0

    console.log('Initial graph context:', graphContext)
    this.onLog('Beginning graph analysis...')

    while (currentNodeId && insightCount < 3) {
      const currentNode = nodes.find(n => n.id === currentNodeId)
      if (!currentNode) {
        console.log('Could not find node:', currentNodeId)
        const nextNode = this.getNextUnvisitedNode(nodes, visitedNodes)
        if (!nextNode) break
        currentNodeId = nextNode.id
        continue
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
        insightCount++
      }

      if (nextNodeId === 'SYNTHESIZE' || insightCount >= 3) {
        this.onLog('Synthesizing insights...')
        const synthesisPrompt = this.buildSynthesisPrompt(insights)
        const synthesisResponse = await this.getCompletion(synthesisPrompt)
        const { insight: synthesizedInsight } = this.parseInsightFromResponse(synthesisResponse)
        
        if (synthesizedInsight) {
          this.onLog('Generated synthesis insight!')
          insights.push(synthesizedInsight)
        }
        break
      }

      currentNodeId = nextNodeId
      if (!currentNodeId || visitedNodes.has(currentNodeId)) {
        const nextNode = this.getNextUnvisitedNode(nodes, visitedNodes)
        currentNodeId = nextNode?.id || null
      }
    }

    console.log('Analysis complete with insights:', insights)
    this.onLog('Analysis complete!')
    return this.deduplicateInsights(insights)
  }
}