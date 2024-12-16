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

export interface LabelPosition {
  id: string;
  x: number;
  y: number;
  label: string;
  visible: boolean;
}

export interface GraphRefs {
  gl?: ExpoWebGLRenderingContext;
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  nodes: { [key: string]: THREE.Mesh };
  edges: THREE.LineSegments[];
  animation?: number;
}