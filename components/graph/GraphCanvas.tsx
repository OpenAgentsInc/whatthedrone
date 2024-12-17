import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Dimensions, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import * as THREE from "three";
import { useIsFocused } from "@react-navigation/native";
import { Node, Edge, GraphRefs, LabelPosition } from "./types";
import { createScene } from "./Scene";

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect?: (node: Node | null) => void;
}

interface TouchState {
  previousTouches: {
    [key: string]: {
      x: number;
      y: number;
    };
  };
  previousDistance: number | null;
  previousAngle: number | null;
}

export function GraphCanvas({ nodes, edges, onNodeSelect }: GraphCanvasProps) {
  const isFocused = useIsFocused();
  const mountedRef = useRef(true);
  const refs = useRef<GraphRefs>({
    nodes: {},
    edges: [],
  });
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const touchState = useRef<TouchState>({
    previousTouches: {},
    previousDistance: null,
    previousAngle: null,
  });

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

  const handleTap = useCallback((event: GestureResponderEvent) => {
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

  const getDistance = (touches: { [key: string]: { x: number; y: number } }) => {
    const touchArray = Object.values(touches);
    if (touchArray.length < 2) return null;
    const dx = touchArray[1].x - touchArray[0].x;
    const dy = touchArray[1].y - touchArray[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touches: { [key: string]: { x: number; y: number } }) => {
    const touchArray = Object.values(touches);
    if (touchArray.length < 2) return null;
    return Math.atan2(
      touchArray[1].y - touchArray[0].y,
      touchArray[1].x - touchArray[0].x
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        touchState.current.previousTouches = {};
        Array.from(evt.nativeEvent.touches).forEach(touch => {
          touchState.current.previousTouches[touch.identifier] = {
            x: touch.pageX,
            y: touch.pageY,
          };
        });
        touchState.current.previousDistance = getDistance(touchState.current.previousTouches);
        touchState.current.previousAngle = getAngle(touchState.current.previousTouches);
      },

      onPanResponderMove: (evt, gestureState) => {
        if (!refs.current.camera) return;

        const currentTouches: { [key: string]: { x: number; y: number } } = {};
        Array.from(evt.nativeEvent.touches).forEach(touch => {
          currentTouches[touch.identifier] = {
            x: touch.pageX,
            y: touch.pageY,
          };
        });

        const touchCount = Object.keys(currentTouches).length;

        if (touchCount === 1) {
          // Pan
          const dx = gestureState.dx * 0.05;
          const dy = gestureState.dy * 0.05;
          
          refs.current.camera.position.x -= dx;
          refs.current.camera.position.y += dy;
        } else if (touchCount === 2) {
          // Pinch to zoom
          const currentDistance = getDistance(currentTouches);
          const currentAngle = getAngle(currentTouches);

          if (touchState.current.previousDistance && currentDistance) {
            const scale = currentDistance / touchState.current.previousDistance;
            refs.current.camera.position.z *= (1 / scale);
          }

          // Rotation
          if (touchState.current.previousAngle && currentAngle) {
            const angleChange = currentAngle - touchState.current.previousAngle;
            refs.current.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angleChange);
          }

          touchState.current.previousDistance = currentDistance;
          touchState.current.previousAngle = currentAngle;
        }

        touchState.current.previousTouches = currentTouches;
        refs.current.camera.lookAt(0, 0, 0);
      },

      onPanResponderRelease: () => {
        touchState.current.previousDistance = null;
        touchState.current.previousAngle = null;
        touchState.current.previousTouches = {};
      },
    })
  ).current;

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
      <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
        <GLView
          key={isFocused ? "focused" : "unfocused"}
          style={styles.canvas}
          onContextCreate={onContextCreate}
          onTouchEnd={handleTap}
        />
      </View>
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