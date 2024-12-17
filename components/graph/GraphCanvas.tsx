import { ExpoWebGLRenderingContext, GLView } from "expo-gl"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    Dimensions, GestureResponderEvent, PanResponder, StyleSheet, Text, View
} from "react-native"
import * as THREE from "three"
import { useIsFocused } from "@react-navigation/native"
import { createScene } from "./Scene"
import { Edge, GraphRefs, LabelPosition, Node } from "./types"

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesSelected?: (nodes: Node[]) => void;
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

// Constants for sensitivity
const PAN_SENSITIVITY = 0.0005; // Reduced from 0.005 (50% less)
const ZOOM_SENSITIVITY = 0.5;  // For pinch zoom
const ROTATION_SENSITIVITY = 1.0; // For two-finger rotation
const MIN_ZOOM = 4;
const MAX_ZOOM = 12;
const INITIAL_Z = 8;

export function GraphCanvas({ nodes, edges, onNodesSelected }: GraphCanvasProps) {
  const isFocused = useIsFocused();
  const mountedRef = useRef(true);
  const refs = useRef<GraphRefs>({
    nodes: {},
    edges: [],
  });
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const touchState = useRef<TouchState>({
    previousTouches: {},
    previousDistance: null,
    previousAngle: null,
  });

  // Keep track of camera target for panning
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

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
        selected: selectedNodeIds.has(node.id),
      });
    });

    setLabelPositions(positions);
  }, [nodes, selectedNodeIds]);

  const animate = useCallback(() => {
    if (!mountedRef.current || !isFocused) {
      return;
    }

    if (!refs.current.gl || !refs.current.renderer || !refs.current.scene || !refs.current.camera) {
      return;
    }

    try {
      // Update node materials based on selection
      nodes.forEach(node => {
        const nodeMesh = refs.current.nodes[node.id];
        if (nodeMesh && nodeMesh.material) {
          const material = nodeMesh.material as THREE.MeshStandardMaterial;
          if (selectedNodeIds.has(node.id)) {
            material.emissive.setHex(0xff0000);
          } else {
            material.emissive.setHex(0x000000);
          }
        }
      });

      refs.current.renderer.render(refs.current.scene, refs.current.camera);
      refs.current.gl.endFrameEXP();
      updateLabelPositions();

      if (mountedRef.current && isFocused) {
        refs.current.animation = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused, updateLabelPositions, nodes, selectedNodeIds]);

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
          // Toggle selection
          const newSelectedIds = new Set(selectedNodeIds);
          if (newSelectedIds.has(node.id)) {
            newSelectedIds.delete(node.id);
          } else {
            newSelectedIds.add(node.id);
          }
          setSelectedNodeIds(newSelectedIds);

          // Notify parent with all selected nodes
          const selectedNodes = nodes.filter(n => newSelectedIds.has(n.id));
          onNodesSelected?.(selectedNodes);
        }
      }
    }
  }, [nodes, selectedNodeIds, onNodesSelected]);

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
          // Simple panning - move the camera target
          const dx = gestureState.dx * PAN_SENSITIVITY;
          const dy = gestureState.dy * PAN_SENSITIVITY;

          // Update camera target
          cameraTarget.current.x -= dx;
          cameraTarget.current.y += dy;

          // Move camera while maintaining its relative position
          refs.current.camera.position.x = cameraTarget.current.x;
          refs.current.camera.position.y = cameraTarget.current.y;
          refs.current.camera.position.z = INITIAL_Z;
          refs.current.camera.lookAt(cameraTarget.current);

        } else if (touchCount === 2) {
          // Handle zoom and rotation
          const currentDistance = getDistance(currentTouches);
          const currentAngle = getAngle(currentTouches);

          // Pinch to zoom
          if (touchState.current.previousDistance && currentDistance) {
            const scale = 1 + ((currentDistance / touchState.current.previousDistance - 1) * ZOOM_SENSITIVITY);
            const newZ = refs.current.camera.position.z / scale;
            refs.current.camera.position.z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZ));
          }

          // Rotation
          if (touchState.current.previousAngle && currentAngle) {
            const angleChange = (currentAngle - touchState.current.previousAngle) * ROTATION_SENSITIVITY;
            refs.current.camera.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angleChange);
          }

          touchState.current.previousDistance = currentDistance;
          touchState.current.previousAngle = currentAngle;
        }

        touchState.current.previousTouches = currentTouches;
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
                backgroundColor: label.selected ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,0,0.5)',
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