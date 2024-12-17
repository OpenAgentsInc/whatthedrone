import { View, StyleSheet, Button, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import GraphAnalysisPanel from './components/GraphAnalysisPanel';
import { INITIAL_GRAPH_DATA } from '../data/graph';
import { Node, Edge } from './types/graph';
import useModelDownload from './components/useModelDownload';
import type { LlamaContext } from 'llama.rn';

// Model details
const DEFAULT_MODEL = {
  repoId: 'hugging-quants/Llama-3.2-3B-Instruct-Q4_K_M-GGUF',
  filename: 'llama-3.2-3b-instruct-q4_k_m.gguf'
}

export default function Index() {
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [initProgress, setInitProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const graphCanvasRef = useRef(null);

  const { downloadAndInitModel } = useModelDownload();

  // Load model on first render
  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const context = await downloadAndInitModel(
        DEFAULT_MODEL.repoId,
        DEFAULT_MODEL.filename,
        (progress) => {
          console.log('Download:', progress.percentage);
          setDownloadProgress(progress.percentage);
        },
        (progress) => {
          console.log('Init:', progress);
          setInitProgress(progress);
        }
      );

      setLlamaContext(context);
    } catch (err) {
      console.error('Failed to load model:', err);
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusNode = (nodeId: string) => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.focusNode(nodeId);
    }
  };

  return (
    <View style={styles.container}>
      <GraphCanvas 
        ref={graphCanvasRef}
        nodes={INITIAL_GRAPH_DATA.nodes}
        edges={INITIAL_GRAPH_DATA.edges}
      />
      
      {/* Model loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {downloadProgress < 100 
              ? `Downloading model: ${downloadProgress}%`
              : `Initializing model: ${initProgress}%`
            }
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={loadModel} />
        </View>
      )}
      
      {/* Analysis panel overlay */}
      <View style={styles.analysisOverlay}>
        <GraphAnalysisPanel
          nodes={INITIAL_GRAPH_DATA.nodes}
          edges={INITIAL_GRAPH_DATA.edges}
          llamaContext={llamaContext}
          onFocusNode={handleFocusNode}
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
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