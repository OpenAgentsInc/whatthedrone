import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Node } from './GraphView';

interface NodeDetailProps {
  node: Node;
  onClose: () => void;
}

export default function NodeDetail({ node, onClose }: NodeDetailProps) {
  const getTypeColor = (type: string): string => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(node.type) }]} />
        <Text style={styles.type}>{node.type.toUpperCase()}</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
      
      <Text style={styles.label}>{node.label}</Text>
      
      {node.content && (
        <Text style={styles.content}>{node.content}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    borderRadius: 10,
    maxHeight: '30%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  type: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#666',
    fontSize: 24,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});