export interface GraphNode {
  id: string
  type: 'source' | 'person' | 'organization' | 'place' | 'event' | 'claim' | 'topic' | 'theory'
  label: string
  metadata?: {
    description?: string
    date?: string
    url?: string
    author?: string
    role?: string
    location?: string
    [key: string]: any
  }
}

export interface GraphEdge {
  from: string
  to: string
  type: 'mentions' | 'claims' | 'located_in' | 'works_for' | 'related_to' | 'supports' | 'opposes'
  metadata?: {
    date?: string
    description?: string
    [key: string]: any
  }
}

export interface GraphInsight {
  description: string
  reasoning: string[]
  confidence: number
  relatedNodes: string[]
}