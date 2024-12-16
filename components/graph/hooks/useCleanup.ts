import { useCallback } from 'react';
import * as THREE from 'three';
import { GraphRefs } from '../utils/types';

export function useCleanup(refs: GraphRefs) {
  return useCallback(() => {
    if (refs.animation) {
      cancelAnimationFrame(refs.animation);
      refs.animation = undefined;
    }

    if (refs.renderer) {
      refs.renderer.dispose();
      refs.renderer = undefined;
    }

    // Cleanup nodes
    Object.values(refs.nodes).forEach(mesh => {
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    });
    refs.nodes = {};

    // Cleanup edges
    refs.edges.forEach(edge => {
      edge.geometry.dispose();
      (edge.material as THREE.Material).dispose();
    });
    refs.edges = [];

    if (refs.scene) {
      refs.scene.clear();
      refs.scene = undefined;
    }

    refs.gl = undefined;
    refs.camera = undefined;
  }, [refs]);
}