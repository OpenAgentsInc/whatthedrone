import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { GraphCanvas } from "../components/GraphCanvas";
import { INITIAL_GRAPH_DATA } from "../data/graph";

export default function Index() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {/* Labels container goes first in the background */}
        <GraphCanvas 
          nodes={INITIAL_GRAPH_DATA.nodes}
          edges={INITIAL_GRAPH_DATA.edges}
          onNodeSelect={setSelectedNode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});