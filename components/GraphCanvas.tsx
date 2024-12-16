import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import * as THREE from "three";
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

interface LabelPosition {
  id: string;
  x: number;
  y: number;
  label: string;
  visible: boolean;
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
  const nodesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const edgesRef = useRef<THREE.LineSegments[]>([]);
  const animationFrameRef = useRef<number>();
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);

  const updateLabelPositions = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    const camera = cameraRef.current;
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

    if (!glRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }

    // Rotate camera around scene
    const time = Date.now() * 0.0002;
    cameraRef.current.position.x = Math.cos(time) * 8;
    cameraRef.current.position.z = Math.sin(time) * 8;
    cameraRef.current.lookAt(0, 0, 0);

    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      glRef.current.endFrameEXP();
      updateLabelPositions();

      if (mountedRef.current && isFocused) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
    }
  }, [isFocused, updateLabelPositions]);

  const setupScene = useCallback((gl: ExpoWebGLRenderingContext) => {
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
      },
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
    camera.position.z = 8;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Create nodes
    nodes.forEach(node => {
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
        shininess: 100,
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
        color: 0x444444,
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
  }, [nodes, edges]);

  const handleTap = useCallback((event: any) => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get('window');

    const mouse = new THREE.Vector2(
      (locationX / width) * 2 - 1,
      -(locationY / height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = Object.entries(nodesRef.current).map(([id, mesh]) => ({
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
    setupScene(gl);
    
    if (isFocused && mountedRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isFocused, setupScene, animate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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