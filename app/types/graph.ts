export interface Node {
  id: string;
  label: string;
  type: string;
  metadata?: any;
}

export interface Edge {
  from: string;
  to: string;
  type: string;
  metadata?: any;
}

export interface GraphInsight {
  description: string;
  reasoning: string[];
  confidence: number;
  relatedNodes: string[];
}