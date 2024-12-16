import * as THREE from 'three';

export interface Node {
  id: string;
  type: string;
  label: string;
  position: THREE.Vector3;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
}

export interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect?: (node: Node | null) => void;
}

export interface LabelPosition {
  id: string;
  x: number;
  y: number;
  label: string;
  visible: boolean;
}