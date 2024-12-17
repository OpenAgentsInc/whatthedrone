import * as THREE from 'three';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { MinimalCanvas } from '../../types/canvas';
import { Node, Edge, GraphRefs } from './types';

// Edge type colors
const EDGE_COLORS = {
  mentions: 0x4a9eff,    // blue
  claims: 0xff4a4a,      // red
  located_in: 0x4aff4a,  // green
  works_for: 0xff4aff,   // magenta
  related_to: 0xffff4a,  // yellow
  supports: 0x00ff00,    // bright green
  opposes: 0xff0000,     // bright red
};

// Node type colors
const NODE_COLORS = {
  source: 0xffffff,      // white
  person: 0x4a9eff,      // blue
  organization: 0xff4a4a, // red
  place: 0x4aff4a,       // green
  event: 0xff4aff,       // magenta
  claim: 0xffff4a,       // yellow
  topic: 0x00ffff,       // cyan
  theory: 0xff00ff,      // purple
};

function createArrowHelper(direction: THREE.Vector3, origin: THREE.Vector3, length: number, color: number): THREE.Object3D {
  const arrowHelper = new THREE.ArrowHelper(
    direction.normalize(),
    origin,
    length,
    color,
    length * 0.2, // headLength
    length * 0.1  // headWidth
  );
  return arrowHelper;
}

export function createScene(
  gl: ExpoWebGLRenderingContext,
  nodes: Node[],
  edges: Edge[]
): GraphRefs {
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
  scene.fog = new THREE.FogExp2(0x000000, 0.1); // Reduced fog density

  const camera = new THREE.PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased intensity
  scene.add(ambientLight);

  // Add directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Create nodes and edges
  const nodeRefs: { [key: string]: THREE.Mesh } = {};
  const edgeRefs: THREE.Object3D[] = [];

  // Create nodes
  nodes.forEach(node => {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: NODE_COLORS[node.type] || 0xffffff,
      emissive: NODE_COLORS[node.type] || 0xffffff,
      emissiveIntensity: 0.2,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(node.position);
    scene.add(mesh);
    nodeRefs[node.id] = mesh;
  });

  // Create edges with arrows
  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const edgeColor = EDGE_COLORS[edge.type] || 0x888888;

    // Create the main line
    const points = [
      fromNode.position,
      toNode.position,
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: edgeColor,
      opacity: 0.8,
      transparent: true,
      linewidth: 2,
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    edgeRefs.push(line);

    // Create arrow
    const direction = new THREE.Vector3().subVectors(toNode.position, fromNode.position);
    const length = direction.length();
    const midPoint = new THREE.Vector3().addVectors(
      fromNode.position,
      direction.multiplyScalar(0.5)
    );
    
    const arrow = createArrowHelper(
      direction.normalize(),
      midPoint,
      length * 0.2,
      edgeColor
    );
    scene.add(arrow);
    edgeRefs.push(arrow);
  });

  return {
    gl,
    renderer,
    scene,
    camera,
    nodes: nodeRefs,
    edges: edgeRefs,
  };
}