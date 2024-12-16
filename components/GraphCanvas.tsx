// ... (previous imports stay the same)

// Add this debug function
const debugPosition = (pos: { x: number, y: number, label: string }) => {
  console.log(`Label: ${pos.label}, X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}`);
};

export function GraphCanvas({ nodes, edges, onNodeSelect }: GraphCanvasProps) {
  // ... (previous state and refs stay the same)

  const updateLabelPositions = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const positions: LabelPosition[] = [];

    nodes.forEach(node => {
      const nodeMesh = nodesRef.current[node.id];
      if (!nodeMesh) return;

      // Get world position
      const worldPos = new THREE.Vector3();
      nodeMesh.getWorldPosition(worldPos);
      
      // Add offset in world space
      const labelPos = worldPos.clone();
      labelPos.x += 0.5;

      // Project to screen coordinates
      labelPos.project(camera);

      // Convert to screen coordinates
      const x = Math.round((labelPos.x * 0.5 + 0.5) * renderer.domElement.width);
      const y = Math.round((-labelPos.y * 0.5 + 0.5) * renderer.domElement.height);

      // Check if node is in front of camera
      const visible = labelPos.z < 1;

      const position = {
        id: node.id,
        x,
        y,
        label: node.label,
        visible,
      };

      debugPosition(position);
      positions.push(position);
    });

    setLabelPositions(positions);
  }, [nodes]);

  // ... (rest of the component stays the same until the return)

  return (
    <View style={styles.container}>
      <GLView
        key={isFocused ? "focused" : "unfocused"}
        style={styles.canvas}
        onContextCreate={onContextCreate}
      />
      {labelPositions.map(label => (
        <Text
          key={label.id}
          style={[
            styles.label,
            {
              left: label.x,
              top: label.y,
              opacity: label.visible ? 1 : 0,
              backgroundColor: 'rgba(0,0,0,0.5)', // Debug background
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
  },
  label: {
    position: 'absolute',
    color: 'white',
    fontSize: 14,
    padding: 4,
    borderRadius: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});