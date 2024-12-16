import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { Mesh, Group } from 'three';

export type NodeType = 'source' | 'person' | 'place' | 'event' | 'claim' | 'organization';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  position: Vector3;
  content?: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type?: string;
}

interface GraphViewProps {
  onNodeSelect: (node: Node | null) => void;
}

// Initial graph data from Telegraph article
export const INITIAL_GRAPH_DATA = {
  nodes: [
    {
      id: 'article1',
      type: 'source',
      label: 'Telegraph Article',
      position: new Vector3(0, 0, 0),
      content: 'DHS Secretary calls for state drone powers',
    },
    // People
    {
      id: 'mayorkas',
      type: 'person',
      label: 'Alejandro Mayorkas',
      position: new Vector3(-2, 1, 0),
      content: 'DHS Secretary requesting drone countermeasure powers for states',
    },
    {
      id: 'hochul',
      type: 'person',
      label: 'Kathy Hochul',
      position: new Vector3(2, 1, 0),
      content: 'NY Governor reporting airport closure due to drone',
    },
    {
      id: 'christie',
      type: 'person',
      label: 'Chris Christie',
      position: new Vector3(0, 2, 0),
      content: 'Former NJ Governor reporting drone sighting above house',
    },
    // Organizations
    {
      id: 'dhs',
      type: 'organization',
      label: 'Department of Homeland Security',
      position: new Vector3(-3, 0, 0),
    },
    {
      id: 'secret_service',
      type: 'organization',
      label: 'US Secret Service',
      position: new Vector3(-3, -1, 0),
    },
    // Places
    {
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart International Airport',
      position: new Vector3(3, 0, 0),
      content: 'Airport closed runways for 1 hour due to drone sighting',
    },
    {
      id: 'east_coast',
      type: 'place',
      label: 'East Coast',
      position: new Vector3(3, -1, 0),
      content: 'Region with reported drone sightings',
    },
    // Events
    {
      id: 'runway_closure',
      type: 'event',
      label: 'Runway Closure',
      position: new Vector3(1, -2, 0),
      content: 'Friday 9:30pm closure due to drone sighting',
    },
    // Claims
    {
      id: 'state_powers',
      type: 'claim',
      label: 'States Need Drone Powers',
      position: new Vector3(-1, -2, 0),
      content: 'States need power to counter drone activity under federal supervision',
    },
    {
      id: 'foreign_involvement',
      type: 'claim',
      label: 'No Foreign Involvement Known',
      position: new Vector3(0, -3, 0),
      content: 'Mayorkas not aware of foreign involvement despite claims of sea-based origins',
    },
  ],
  edges: [
    // Article connections
    { id: 'e1', from: 'article1', to: 'mayorkas' },
    { id: 'e2', from: 'article1', to: 'hochul' },
    { id: 'e3', from: 'article1', to: 'christie' },
    
    // Organizational relationships
    { id: 'e4', from: 'mayorkas', to: 'dhs' },
    { id: 'e5', from: 'dhs', to: 'secret_service' },
    
    // Event connections
    { id: 'e6', from: 'hochul', to: 'stewart_airport' },
    { id: 'e7', from: 'stewart_airport', to: 'runway_closure' },
    
    // Claims and statements
    { id: 'e8', from: 'mayorkas', to: 'state_powers' },
    { id: 'e9', from: 'mayorkas', to: 'foreign_involvement' },
    
    // Location relationships
    { id: 'e10', from: 'stewart_airport', to: 'east_coast' },
  ]
};

export default function GraphView({ onNodeSelect }: GraphViewProps) {
  const groupRef = useRef<Group>();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const getColorForType = (type: NodeType): string => {
    switch(type) {
      case 'source': return '#ff0000';
      case 'person': return '#00ff00';
      case 'place': return '#0000ff';
      case 'event': return '#ffff00';
      case 'claim': return '#ff00ff';
      case 'organization': return '#00ffff';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Render nodes */}
      {INITIAL_GRAPH_DATA.nodes.map(node => (
        <mesh
          key={node.id}
          position={node.position}
          onClick={(e) => {
            e.stopPropagation();
            onNodeSelect(node);
          }}
        >
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial 
            color={getColorForType(node.type)}
            emissive={getColorForType(node.type)}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Render edges */}
      {INITIAL_GRAPH_DATA.edges.map(edge => {
        const from = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.from);
        const to = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.to);
        if (!from || !to) return null;

        const points = [
          from.position.x, from.position.y, from.position.z,
          to.position.x, to.position.y, to.position.z
        ];

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(points, 3));

        return (
          <line key={edge.id} geometry={geometry}>
            <lineBasicMaterial attach="material" color="#ffffff" opacity={0.5} transparent />
          </line>
        );
      })}
    </group>
  );
}