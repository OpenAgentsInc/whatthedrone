import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useState } from 'react';
import GraphView, { Node } from '../components/GraphView';
import NodeDetail from '../components/NodeDetail';

export default function Index() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <GraphView onNodeSelect={setSelectedNode} />
      </Canvas>
      
      {selectedNode && (
        <View style={styles.detailContainer}>
          <NodeDetail 
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  detailContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});