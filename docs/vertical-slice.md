# Vertical Slice: Initial Graph Visualization

## Goal
Create a minimal viable demo showing an interactive graph visualization of concepts extracted from our first source article about DHS and drone powers.

## Expected Demo Features
- View the graph of concepts from the Telegraph article
- Pan and zoom the visualization
- Click nodes to see details
- Basic categorization of concepts (People, Places, Events, Claims, etc.)

## Implementation Steps (5-minute setup)

### 1. Basic App Setup (2 minutes)
```bash
# From project root
npm install @react-navigation/native @react-navigation/native-stack expo-three three react-three-fiber
npm install expo-sqlite @types/three
```

### 2. Create Initial Screens (1 minute)
Replace current `app/index.tsx` with:

```typescript
import { View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useState } from 'react';
import GraphView from '../components/GraphView';

export default function Index() {
  const [selectedNode, setSelectedNode] = useState(null);
  
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <GraphView 
          onNodeSelect={setSelectedNode}
          initialData={INITIAL_GRAPH_DATA}
        />
      </Canvas>
      {selectedNode && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}>
          {/* Node details here */}
        </View>
      )}
    </View>
  );
}
```

### 3. Create Essential Components (1 minute)
Create new file `components/GraphView.tsx`:

```typescript
import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { Vector3 } from 'three';

const INITIAL_GRAPH_DATA = {
  nodes: [
    {
      id: 'article1',
      type: 'source',
      label: 'Telegraph Article',
      position: new Vector3(0, 0, 0),
    },
    // People
    {
      id: 'mayorkas',
      type: 'person',
      label: 'Alejandro Mayorkas',
      position: new Vector3(-2, 1, 0),
    },
    {
      id: 'hochul',
      type: 'person',
      label: 'Kathy Hochul',
      position: new Vector3(2, 1, 0),
    },
    // Places
    {
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart International Airport',
      position: new Vector3(0, 2, 0),
    },
    // Events
    {
      id: 'runway_closure',
      type: 'event',
      label: 'Runway Closure',
      position: new Vector3(1, -1, 0),
    },
    // Claims
    {
      id: 'state_powers',
      type: 'claim',
      label: 'States Need Drone Powers',
      position: new Vector3(-1, -1, 0),
    },
  ],
  edges: [
    { from: 'article1', to: 'mayorkas' },
    { from: 'article1', to: 'hochul' },
    { from: 'hochul', to: 'stewart_airport' },
    { from: 'stewart_airport', to: 'runway_closure' },
    { from: 'mayorkas', to: 'state_powers' },
  ]
};

export default function GraphView({ onNodeSelect }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Add basic rotation animation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Render nodes */}
      {INITIAL_GRAPH_DATA.nodes.map(node => (
        <mesh
          key={node.id}
          position={node.position}
          onClick={() => onNodeSelect(node)}
        >
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial 
            color={getColorForType(node.type)} 
          />
        </mesh>
      ))}
      
      {/* Render edges */}
      {INITIAL_GRAPH_DATA.edges.map(edge => {
        const from = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.from);
        const to = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.to);
        return (
          <line>
            <bufferGeometry attach="geometry">
              <float32BufferAttribute 
                attach="attributes-position"
                array={[
                  from.position.x, from.position.y, from.position.z,
                  to.position.x, to.position.y, to.position.z
                ]}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#ffffff" />
          </line>
        );
      })}
    </group>
  );
}

function getColorForType(type) {
  switch(type) {
    case 'source': return '#ff0000';
    case 'person': return '#00ff00';
    case 'place': return '#0000ff';
    case 'event': return '#ffff00';
    case 'claim': return '#ff00ff';
    default: return '#ffffff';
  }
}
```

### 4. Update App Config (1 minute)
Update `app.json` to include required permissions and configurations:

```json
{
  "expo": {
    ...
    "plugins": [
      [
        "expo-three"
      ]
    ]
  }
}
```

## Next Steps After Initial Demo
1. Implement SQLite database setup
2. Add proper entity extraction
3. Implement proper graph layout algorithm
4. Add touch gestures for graph interaction
5. Enhance node detail view
6. Add search functionality

## Testing the Demo
1. Run `npx expo start`
2. Open on your device or simulator
3. You should see:
   - 3D graph visualization with colored nodes
   - Ability to rotate view
   - Node selection showing basic details
   - Different colors for different types of entities

## Known Limitations of Initial Demo
- Hard-coded graph data
- Basic 3D rendering without optimizations
- Limited interaction capabilities
- No persistence
- No search functionality
- Manual entity categorization