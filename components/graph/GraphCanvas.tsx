import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import * as THREE from "three";
import { useIsFocused } from "@react-navigation/native";
import { Node, Edge, GraphRefs, LabelPosition } from "./types";
import { createScene } from "./Scene";

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
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);

  const updateLabelPositions = useCallback(() => {
    if (!refs.current.camera || !refs.current.renderer) return;

    const camera = refs.current.camera;
    const { width, height } = Dimensions.get('window');
    const positions: LabelPosition[] = [];

    nodes.forEach(node => {
      const nodeMesh = refs.current.nodes[node.id];
      if (!nodeMesh) return;

      // Get screen position
      const vector = new THREE.Vector3();
      vector.setFromMatrixPosition(nodeMesh.matrixWorld);
      vector.project(camera);

      // Convert to screen coordinates
      const x = (vector.x * 0.5 + 0.5) * width;
      const y = (-vector.y * 0.5 + 0.5) * height;

      // Check if node is in front of camera
      const visible = vector.z < 1;

      positions.push({
        id: node.id,
        x,
        y,
        label: node.label,
        visible,
      });
    });

    setLabelPositions(positions);
  }, [nodes]);

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

    try {
      refs.current.renderer.render(refs.current.scene, refs.current.camera);
      refs.current.gl.endFrameEXP();
      updateLabelPositions();

      if (mountedRef.current && isFocused) {
        refs.current.animation = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused, updateLabelPositions]);

  const handleTap = useCallback((event: any) => {
    if (!refs.current.camera || !refs.current.renderer || !refs.current.scene) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get('window');

    const mouse = new THREE.Vector2(
      (locationX / width) * 2 - 1,
      -(locationY / height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, refs.current.camera);

    const meshes = Object.entries(refs.current.nodes).map(([id, mesh]) => ({
      id,
      mesh,
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
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {labelPositions.map(label => (
          <Text
            key={label.id}
            style={[
              styles.label,
              {
                position: 'absolute',
                left: label.x,
                top: label.y,
                opacity: label.visible ? 1 : 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                transform: [
                  { translateX: -50 }, // Center horizontally
                ],
              },
            ]}
          >
            {label.label}
          </Text>
        ))}
      </View>
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
  label: {
    position: 'absolute',
    color: 'white',
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'JetBrainsMono',
    textAlign: 'center',
  },
});