import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { GraphAnalysisPanel } from '../components/GraphAnalysisPanel';
import { INITIAL_GRAPH_DATA } from '../data/graph';
import { GraphNode, GraphEdge } from '../types/graph';
import { useStores } from '@/models';
import { observer } from 'mobx-react-lite';

export default observer(function Index() {
  const { modelStore } = useStores();
  const context = modelStore.context;

  const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
  const [surroundingNodes, setSurroundingNodes] = useState<GraphNode[]>([]);

  // When nodes are selected, find their immediate neighbors
  const handleNodeSelect = (nodes: GraphNode[]) => {
    setSelectedNodes(nodes);
    
    // Find all nodes connected to selected nodes
    const neighbors = new Set<GraphNode>();
    
    INITIAL_GRAPH_DATA.edges.forEach(edge => {
      const fromNode = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.from);
      const toNode = INITIAL_GRAPH_DATA.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      // If either end is selected, add the other end to neighbors
      if (nodes.some(n => n.id === edge.from)) {
        neighbors.add(toNode);
      }
      if (nodes.some(n => n.id === edge.to)) {
        neighbors.add(fromNode);
      }
    });

    // Remove selected nodes from neighbors
    nodes.forEach(n => neighbors.delete(n));
    
    setSurroundingNodes(Array.from(neighbors));
  };

  return (
    <View style={styles.container}>
      <GraphCanvas 
        nodes={INITIAL_GRAPH_DATA.nodes}
        edges={INITIAL_GRAPH_DATA.edges}
        onNodesSelected={handleNodeSelect}
      />
      
      {/* Analysis panel overlay */}
      <View style={styles.analysisOverlay}>
        <GraphAnalysisPanel
          selectedNodes={selectedNodes}
          surroundingNodes={surroundingNodes}
          edges={INITIAL_GRAPH_DATA.edges}
          llamaContext={context}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  analysisOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    maxHeight: '50%', // Take up to half the screen
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});