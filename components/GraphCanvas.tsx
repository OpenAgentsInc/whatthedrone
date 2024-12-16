import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import * as THREE from "three";
import { MinimalCanvas } from "../types/canvas";
import { useIsFocused } from "@react-navigation/native";

interface Node {
  id: string;
  type: string;
  label: string;
  position: THREE.Vector3;
}

interface Edge {
  id: string;
  from: string;
  to: string;
}

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect?: (node: Node | null) => void;
}

export function GraphCanvas({ nodes, edges, onNodeSelect }: GraphCanvasProps) {
  const isFocused = useIsFocused();
  const mountedRef = useRef(true);
  const glRef = useRef<ExpoWebGLRenderingContext>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const nodesRef = useRef<{ [key: string]: THREE.Mesh }>({}); // Store node meshes by id
  const edgesRef = useRef<THREE.LineSegments[]>([]);
  const animationFrameRef = useRef<number>();

  const animate = useCallback(() => {
    if (!mountedRef.current || !isFocused) {
      return;
    }

    if (!glRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }

    // Rotate camera around scene
    const time = Date.now() * 0.0005;
    cameraRef.current.position.x = Math.cos(time) * 5;
    cameraRef.current.position.z = Math.sin(time) * 5;
    cameraRef.current.lookAt(0, 0, 0);

    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      glRef.current.endFrameEXP();

      if (mountedRef.current && isFocused) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused]);

  const cleanupGL = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = undefined;
    }

    // Cleanup nodes
    Object.values(nodesRef.current).forEach(mesh => {
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    });
    nodesRef.current = {};

    // Cleanup edges
    edgesRef.current.forEach(edge => {
      edge.geometry.dispose();
      (edge.material as THREE.Material).dispose();
    });
    edgesRef.current = [];

    if (sceneRef.current) {
      sceneRef.current.clear();
      sceneRef.current = undefined;
    }

    glRef.current = undefined;
    cameraRef.current = undefined;
  }, []);

  const getColorForType = (type: string): number => {
    switch(type) {
      case 'source': return 0xff0000;
      case 'person': return 0x00ff00;
      case 'place': return 0x0000ff;
      case 'event': return 0xffff00;
      case 'claim': return 0xff00ff;
      case 'organization': return 0x00ffff;
      default: return 0xffffff;
    }
  };

  const setupScene = useCallback((gl: ExpoWebGLRenderingContext) => {
    cleanupGL();

    const renderer = new THREE.WebGLRenderer({
      // @ts-ignore
      canvas: {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: gl.drawingBufferHeight,
        getContext: () => gl,
        toDataURL: () => "",
        toBlob: () => {},
        captureStream: () => new MediaStream(),
      } as MinimalCanvas,
      context: gl,
    });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.fog = new THREE.FogExp2(0x000000, 0.15);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Create nodes
    nodes.forEach(node => {
      const geometry = new THREE.SphereGeometry(0.2, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: getColorForType(node.type),
        emissive: getColorForType(node.type),
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(node.position);
      scene.add(mesh);
      nodesRef.current[node.id] = mesh;
    });

    // Create edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const points = [
        fromNode.position,
        toNode.position,
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      });
      const line = new THREE.LineSegments(geometry, material);
      scene.add(line);
      edgesRef.current.push(line);
    });

    // Store refs
    glRef.current = gl;
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return true;
  }, [nodes, edges, cleanupGL]);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    const success = setupScene(gl);
    if (!success) {
      return;
    }

    if (isFocused && mountedRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isFocused, setupScene, animate]);

  useEffect(() => {
    if (isFocused) {
      cleanupGL();
    } else {
      cleanupGL();
    }
  }, [isFocused, cleanupGL]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanupGL();
    };
  }, [cleanupGL]);

  return (
    <View style={styles.container}>
      <GLView
        key={isFocused ? "focused" : "unfocused"}
        style={styles.canvas}
        onContextCreate={onContextCreate}
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
  },
});