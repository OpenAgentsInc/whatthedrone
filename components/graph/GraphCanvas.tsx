import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import * as THREE from "three";
import { useIsFocused } from "@react-navigation/native";
import { Node, Edge, GraphRefs, LabelPosition } from "./utils/types";
import { createScene } from "./core/Scene";
import { useAnimation } from "./hooks/useAnimation";
import { useCleanup } from "./hooks/useCleanup";
import { screenToNormalizedCoordinates } from "./utils/coordinates";

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

  const cleanup = useCleanup(refs.current);
  const animate = useAnimation(refs.current, isFocused, mountedRef, setLabelPositions);

  const handleTap = useCallback((event: any) => {
    if (!refs.current.camera || !refs.current.renderer || !refs.current.scene) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get('window');

    const mouse = screenToNormalizedCoordinates(locationX, locationY, width, height);
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
    if (isFocused) {
      cleanup();
    } else {
      cleanup();
    }
  }, [isFocused, cleanup]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

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
    fontFamily: 'JetBrainsMono',
  },
});