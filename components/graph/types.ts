import * as THREE from 'three';

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

export interface GraphRefs {
  gl?: WebGLRenderingContext;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  nodes: { [key: string]: THREE.Mesh };
  edges: THREE.Line[];
  animation?: number;
}

export interface LabelPosition {
  id: string;
  x: number;
  y: number;
  label: string;
  visible: boolean;
  selected?: boolean;
}