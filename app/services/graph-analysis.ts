import { LlamaContext } from 'llama.rn'
import { GraphNode, GraphEdge, GraphInsight } from '../types/graph'

const ANALYSIS_SYSTEM_PROMPT = `You are analyzing a knowledge graph about drone activities.
Focus on finding non-obvious connections and patterns.
Think carefully and explain your reasoning step by step.
Format your response exactly as requested.`

export class GraphAnalysisService {
  private context: LlamaContext
  private attempts: number
  private temperature: number
  private maxTokens: number

  constructor(
    context: LlamaContext,
    config: {
      attempts?: number
      temperature?: number
      maxTokens?: number
    } = {}
  ) {
    this.context = context
    this.attempts = config.attempts || 8
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 1000
  }

  private formatGraphForLLM(nodes: GraphNode[], edges: GraphEdge[]): string {
    return `
Nodes:
${nodes.map(n => `- ${n.label} (${n.type}): ${n.metadata?.description || ''}`).join('\\n')}

Connections:
${edges.map(e => {
      const from = nodes.find(n => n.id === e.from)
      const to = nodes.find(n => n.id === e.to)
      return `- ${from?.label} ${e.type} ${to?.label}`
    }).join('\\n')}
`
  }

  private buildPrompt(
    graphContext: string,
    attempt: number,
    previousInsights: GraphInsight[]
  ): string {
    return `${ANALYSIS_SYSTEM_PROMPT}

Graph context:
${graphContext}

Previous insights found:
${previousInsights.map(i => `- ${i.description}`).join('\\n')}

Attempt ${attempt + 1}/${this.attempts}:

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
`
  }

  private parseInsightFromResponse(response: string): GraphInsight | null {
    try {
      const insightMatch = response.match(/INSIGHT: (.+)/)
      const reasoningMatch = response.match(/REASONING: ([\\s\\S]+?)\\nCONFIDENCE:/)
      const confidenceMatch = response.match(/CONFIDENCE: (\\d+)/)
      const nodesMatch = response.match(/NODES: (.+)/)

      if (!insightMatch || !reasoningMatch || !confidenceMatch || !nodesMatch) {
        return null
      }

      const description = insightMatch[1].trim()
      const reasoning = reasoningMatch[1]
        .split('\\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      const confidence = parseInt(confidenceMatch[1])
      const nodes = nodesMatch[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      return {
        description,
        reasoning,
        confidence,
        relatedNodes: nodes,
      }
    } catch (e) {
      console.error('Failed to parse insight:', e)
      return null
    }
  }

  private async getCompletion(prompt: string): Promise<string> {
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
          }
        )
        .then(() => resolve(response))
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

  async analyzeGraphSection(
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): Promise<GraphInsight[]> {
    const insights: GraphInsight[] = []
    const graphContext = this.formatGraphForLLM(nodes, edges)

    for (let i = 0; i < this.attempts; i++) {
      const prompt = this.buildPrompt(graphContext, i, insights)
      const response = await this.getCompletion(prompt)
      const newInsight = this.parseInsightFromResponse(response)

      if (newInsight && newInsight.confidence > 70) {
        insights.push(newInsight)
      }
    }

    return this.deduplicateInsights(insights)
  }
}