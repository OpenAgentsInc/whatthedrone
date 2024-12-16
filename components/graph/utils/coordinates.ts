import * as THREE from 'three';
import { Dimensions } from 'react-native';
import { LabelPosition, Node, GraphRefs } from './types';

export function calculateLabelPositions(
  nodes: Node[],
  refs: GraphRefs
): LabelPosition[] {
  if (!refs.camera) return [];

  const { width, height } = Dimensions.get('window');
  const positions: LabelPosition[] = [];

  nodes.forEach(node => {
    const nodeMesh = refs.nodes[node.id];
    if (!nodeMesh) return;

    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(nodeMesh.matrixWorld);
    vector.project(refs.camera!);

    const x = (vector.x * 0.5 + 0.5) * width;
    const y = (-vector.y * 0.5 + 0.5) * height;
    const visible = vector.z < 1;

    positions.push({
      id: node.id,
      x,
      y,
      label: node.label,
      visible,
    });
  });

  return positions;
}

export function screenToNormalizedCoordinates(
  x: number,
  y: number,
  width: number,
  height: number
): THREE.Vector2 {
  return new THREE.Vector2(
    (x / width) * 2 - 1,
    -(y / height) * 2 + 1
  );
}