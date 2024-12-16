import { View, StyleSheet } from 'react-native';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { INITIAL_GRAPH } from '../data/initial-graph';

export default function Index() {
  return (
    <View style={styles.container}>
      <GraphCanvas 
        nodes={INITIAL_GRAPH.nodes}
        edges={INITIAL_GRAPH.edges}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});