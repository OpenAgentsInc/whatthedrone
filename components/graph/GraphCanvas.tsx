import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import * as THREE from "three";
import { useIsFocused } from "@react-navigation/native";
import { Node, Edge, GraphRefs } from "./utils/types";
import { createScene } from "./core/Scene";

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect?: (node: Node | null) => void;
}

export function GraphCanvas({ nodes, edges, onNodeSelect }: GraphCanvasProps) {
  const isFocused = useIsFocused();
  const mountedRef = useRef(true);
  const refs = useRef<GraphRefs>({
    nodes: {},
    edges: [],
  });

  const animate = useCallback(() => {
    if (!mountedRef.current || !isFocused) {
      return;
    }

    if (!refs.current.gl || !refs.current.renderer || !refs.current.scene || !refs.current.camera) {
      return;
    }

    // Rotate camera around scene
    const time = Date.now() * 0.0002;
    refs.current.camera.position.x = Math.cos(time) * 8;
    refs.current.camera.position.z = Math.sin(time) * 8;
    refs.current.camera.lookAt(0, 0, 0);

    // Make all sprites face the camera
    Object.values(refs.current.nodes).forEach(group => {
      const sprite = group.children[1];
      if (sprite instanceof THREE.Sprite) {
        sprite.lookAt(refs.current.camera!.position);
      }
    });

    try {
      refs.current.renderer.render(refs.current.scene, refs.current.camera);
      refs.current.gl.endFrameEXP();

      if (mountedRef.current && isFocused) {
        refs.current.animation = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused]);

  const handleTap = useCallback((event: any) => {
    if (!refs.current.camera || !refs.current.renderer || !refs.current.scene) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = refs.current.renderer.domElement;

    const mouse = new THREE.Vector2(
      (locationX / width) * 2 - 1,
      -(locationY / height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, refs.current.camera);

    const meshes = Object.entries(refs.current.nodes).map(([id, group]) => ({
      id,
      mesh: group.children[0] as THREE.Mesh,
    }));

    const intersects = raycaster.intersectObjects(meshes.map(m => m.mesh));
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const nodeEntry = meshes.find(m => m.mesh === hitMesh);
      if (nodeEntry) {
        const node = nodes.find(n => n.id === nodeEntry.id);
        if (node) {
          onNodeSelect?.(node);
        }
      }
    } else {
      onNodeSelect?.(null);
    }
  }, [nodes, onNodeSelect]);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    Object.assign(refs.current, createScene(gl, nodes, edges));
    
    if (isFocused && mountedRef.current) {
      refs.current.animation = requestAnimationFrame(animate);
    }
  }, [isFocused, nodes, edges, animate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refs.current.animation) {
        cancelAnimationFrame(refs.current.animation);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView
        key={isFocused ? "focused" : "unfocused"}
        style={styles.canvas}
        onContextCreate={onContextCreate}
        onTouchEnd={handleTap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});