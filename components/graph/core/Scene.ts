import * as THREE from 'three';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { MinimalCanvas } from '../../../types/canvas';
import { Node, Edge, GraphRefs } from '../utils/types';

function createTextSprite(text: string) {
  const spriteMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1, 0.25, 1);
  sprite.position.set(0.5, 0, 0); // Position to the right of the sphere
  
  return sprite;
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
  scene.fog = new THREE.FogExp2(0x000000, 0.15);

  const camera = new THREE.PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Create nodes and edges
  const nodeRefs: { [key: string]: THREE.Group } = {};
  const edgeRefs: THREE.LineSegments[] = [];

  // Create nodes
  nodes.forEach(node => {
    const group = new THREE.Group();
    group.position.copy(node.position);

    // Create sphere
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Add text sprite
    const textSprite = createTextSprite(node.label);
    group.add(textSprite);

    scene.add(group);
    nodeRefs[node.id] = group;
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
    edgeRefs.push(line);
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