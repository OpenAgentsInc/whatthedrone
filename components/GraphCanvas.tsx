import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import * as THREE from "three";
import { MinimalCanvas } from "../types/canvas";
import { useIsFocused } from "@react-navigation/native";

// ... (interfaces stay the same)

export function GraphCanvas({ nodes, edges, onNodeSelect }: GraphCanvasProps) {
  // ... (previous refs and state stay the same)

  const updateLabelPositions = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const { width, height } = Dimensions.get('window');
    const positions: LabelPosition[] = [];

    nodes.forEach(node => {
      const nodeMesh = nodesRef.current[node.id];
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

      const position = {
        id: node.id,
        x,
        y,
        label: node.label,
        visible,
      };

      console.log(`Label ${node.label}: x=${x.toFixed(0)}, y=${y.toFixed(0)}, visible=${visible}`);
      positions.push(position);
    });

    setLabelPositions(positions);
  }, [nodes]);

  const handleTap = useCallback((event: any) => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get('window');

    // Convert touch coordinates to normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
      (locationX / width) * 2 - 1,
      -(locationY / height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Get all meshes
    const meshes = Object.entries(nodesRef.current).map(([id, mesh]) => ({
      id,
      mesh,
    }));

    // Find intersections
    const intersects = raycaster.intersectObjects(meshes.map(m => m.mesh));
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const nodeEntry = meshes.find(m => m.mesh === hitMesh);
      if (nodeEntry) {
        const node = nodes.find(n => n.id === nodeEntry.id);
        if (node) {
          console.log('Node selected:', node.label);
          onNodeSelect?.(node);
        }
      }
    } else {
      onNodeSelect?.(null);
    }
  }, [nodes, onNodeSelect]);

  // ... (setupScene and other functions stay the same until return)

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
                zIndex: 2,
              },
            ]}
          >
            {label.label}
          </Text>
        ))}
      </View>
      
      <GLView
        key={isFocused ? "focused" : "unfocused"}
        style={[styles.canvas, { zIndex: 1 }]}
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
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: 'absolute',
    color: 'white',
    fontSize: 14,
    padding: 4,
    borderRadius: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    elevation: 3,
  },
});