import { Vector3 } from 'three';

// Types for our graph data
export interface Node {
  id: string;
  type: 'source' | 'person' | 'organization' | 'place' | 'event' | 'claim' | 'topic' | 'theory';
  label: string;
  position: Vector3;
  sourceId?: string; // Reference to source document if entity was first mentioned there
  metadata?: {
    date?: string;
    url?: string;
    author?: string;
    role?: string;
    location?: string;
    description?: string;
  };
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: 'mentions' | 'claims' | 'located_in' | 'works_for' | 'related_to' | 'supports' | 'opposes';
  sourceId: string; // Which source document established this relationship
  metadata?: {
    date?: string;
    description?: string;
  };
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}