import { LlamaContext } from "llama.rn"
import React, { useState } from "react"
import {
    ActivityIndicator, Button, ScrollView, StyleSheet, Text, View
} from "react-native"
import GraphAnalysisService from "../services/graph-analysis"
import { Edge, GraphInsight, Node } from "../types/graph"

interface Props {
  nodes: Node[]
  edges: Edge[]
  llamaContext: LlamaContext | null
  onFocusNode?: (nodeId: string) => void
}

export default function GraphAnalysisPanel({
  nodes,
  edges,
  llamaContext,
  onFocusNode
}: Props) {
  const [insights, setInsights] = useState<GraphInsight[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function beginAnalysis() {
    if (!llamaContext) {
      setError('Please load Llama model first')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setInsights([])
    setLogs([])

    try {
      const analysisService = new GraphAnalysisService(llamaContext, {
        attempts: 8,
        temperature: 0.7,
        onLog: (message: string, nodeId?: string) => {
          setLogs(prev => [...prev, message])
          if (nodeId && onFocusNode) {
            onFocusNode(nodeId)
          }
        }
      })

      const allInsights = await analysisService.analyzeGraph(nodes, edges)
      setInsights(prev => [...prev, ...allInsights])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="Begin Analysis"
        onPress={beginAnalysis}
        disabled={isAnalyzing || !llamaContext}
      />

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Analyzing graph...</Text>
        </View>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.contentContainer}>
        <ScrollView style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>Analysis Log</Text>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>

        <ScrollView style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {insights.map((insight, i) => (
            <View key={i} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.description}</Text>
              <Text style={styles.confidence}>Confidence: {insight.confidence}%</Text>

              <Text style={styles.reasoningTitle}>Reasoning:</Text>
              {insight.reasoning.map((step, j) => (
                <Text key={j} style={styles.reasoningStep}>
                  {j + 1}. {step}
                </Text>
              ))}

              <Text style={styles.nodesTitle}>Related Nodes:</Text>
              <Text style={styles.nodes}>
                {insight.relatedNodes.join(', ')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 8,
    height: '50%',
  },
  contentContainer: {
    flexDirection: 'row',
    marginTop: 16,
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logsContainer: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
  },
  logEntry: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#888',
  },
  error: {
    color: '#ff4444',
    marginTop: 8,
  },
  insightsContainer: {
    flex: 2,
    marginLeft: 8,
  },
  insightCard: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  confidence: {
    color: '#888',
    marginBottom: 8,
  },
  reasoningTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  reasoningStep: {
    color: '#ccc',
    marginBottom: 2,
    paddingLeft: 8,
  },
  nodesTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  nodes: {
    color: '#888',
  },
})