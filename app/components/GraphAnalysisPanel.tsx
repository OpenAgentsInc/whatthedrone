import React, { useState } from 'react'
import { View, Text, Button, ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import { GraphAnalysisService } from '../services/graph-analysis'
import { Node, Edge, GraphInsight } from '../types/graph'
import { LlamaContext } from 'llama.rn'

interface Props {
  selectedNodes: Node[]
  surroundingNodes: Node[]
  edges: Edge[]
  llamaContext: LlamaContext | null
}

export function GraphAnalysisPanel({ 
  selectedNodes,
  surroundingNodes,
  edges,
  llamaContext
}: Props) {
  const [insights, setInsights] = useState<GraphInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyzeSelection() {
    if (!llamaContext) {
      setError('Please load Llama model first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisService = new GraphAnalysisService(llamaContext, {
        attempts: 8,
        temperature: 0.7
      })

      // Get all relevant nodes
      const relevantNodeIds = new Set([
        ...selectedNodes.map(n => n.id),
        ...surroundingNodes.map(n => n.id)
      ])

      // Get edges between relevant nodes
      const relevantEdges = edges.filter(edge => 
        relevantNodeIds.has(edge.from) && relevantNodeIds.has(edge.to)
      )

      const newInsights = await analysisService.analyzeGraphSection(
        [...selectedNodes, ...surroundingNodes],
        relevantEdges
      )

      setInsights(newInsights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!selectedNodes.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Select nodes to analyze connections</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Button
        title="Analyze Connections"
        onPress={analyzeSelection}
        disabled={isAnalyzing || !llamaContext}
      />

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Analyzing connections...</Text>
        </View>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <ScrollView style={styles.insightsContainer}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 8,
  },
  message: {
    color: '#888',
    textAlign: 'center',
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
    marginTop: 16,
    maxHeight: 400,
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