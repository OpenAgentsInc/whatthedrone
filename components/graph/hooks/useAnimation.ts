import { useCallback } from 'react';
import { GraphRefs } from '../utils/types';
import { calculateLabelPositions } from '../utils/coordinates';

export function useAnimation(
  refs: GraphRefs,
  isFocused: boolean,
  mountedRef: React.RefObject<boolean>,
  onLabelUpdate: (positions: any[]) => void
) {
  const animate = useCallback(() => {
    if (!mountedRef.current || !isFocused) {
      return;
    }

    if (!refs.gl || !refs.renderer || !refs.scene || !refs.camera) {
      return;
    }

    // Rotate camera around scene
    const time = Date.now() * 0.0002;
    refs.camera.position.x = Math.cos(time) * 8;
    refs.camera.position.z = Math.sin(time) * 8;
    refs.camera.lookAt(0, 0, 0);

    try {
      refs.renderer.render(refs.scene, refs.camera);
      refs.gl.endFrameEXP();
      
      // Update label positions
      const positions = calculateLabelPositions(Object.values(refs.nodes), refs);
      onLabelUpdate(positions);

      if (mountedRef.current && isFocused) {
        refs.animation = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused, refs, mountedRef, onLabelUpdate]);

  return animate;
}