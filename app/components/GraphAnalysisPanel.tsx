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

    console.log('Beginning analysis with nodes:', nodes.length)
    console.log('and edges:', edges.length)

    setIsAnalyzing(true)
    setError(null)
    setInsights([])
    setLogs([])

    try {
      const analysisService = new GraphAnalysisService(llamaContext, {
        attempts: 8,
        temperature: 0.7,
        onLog: (message: string, nodeId?: string) => {
          console.log('Log:', message, nodeId)
          setLogs(prev => [...prev, message])
          if (nodeId && onFocusNode) {
            onFocusNode(nodeId)
          }
        }
      })

      const allInsights = await analysisService.analyzeGraph(nodes, edges)
      console.log('Analysis complete, got insights:', allInsights)
      setInsights(prev => {
        console.log('Previous insights:', prev)
        console.log('Adding new insights:', allInsights)
        return [...prev, ...allInsights]
      })
    } catch (err) {
      console.error('Analysis failed:', err)
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
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Analysis Log</Text>
          <ScrollView 
            style={styles.logsContainer}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          >
            {logs.map((log, i) => (
              <Text key={i} style={styles.logEntry}>{log}</Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights ({insights.length})</Text>
          <ScrollView 
            style={styles.insightsContainer}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          >
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
    marginTop: 16,
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logsSection: {
    height: '30%',
    marginBottom: 16,
  },
  logsContainer: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  insightsSection: {
    flex: 1,
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
    flex: 1,
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