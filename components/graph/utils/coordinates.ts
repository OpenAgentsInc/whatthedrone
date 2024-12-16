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

    // Create a position slightly to the right of the node for the label
    const worldPos = new THREE.Vector3();
    nodeMesh.getWorldPosition(worldPos);
    
    // Offset the label position slightly to the right
    const labelPos = worldPos.clone();
    labelPos.x += 0.5;

    // Project to screen coordinates
    labelPos.project(refs.camera!);

    // Convert to screen coordinates
    const x = (labelPos.x * 0.5 + 0.5) * width;
    const y = (-labelPos.y * 0.5 + 0.5) * height;

    // Check if node is in front of camera
    const visible = labelPos.z < 1;

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