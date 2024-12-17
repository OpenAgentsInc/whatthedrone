import { Vector3 } from 'three';

// Function to generate positions for nodes
export function generatePosition(index: number, total: number, radius: number = 5): Vector3 {
  const angle = (index / total) * Math.PI * 2;
  return new Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    0
  );
}