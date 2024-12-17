import React, { useState } from 'react'
import { View, Text, Button, ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import { GraphAnalysisService } from '../services/graph-analysis'
import { GraphNode, GraphEdge, GraphInsight } from '../types/graph'
import { LlamaContext } from 'llama.rn'
import { colors } from '@/theme/colorsDark'

interface Props {
  selectedNodes: GraphNode[]
  surroundingNodes: GraphNode[]
  edges: GraphEdge[]
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
      const relevantNodes = new Set([
        ...selectedNodes,
        ...surroundingNodes
      ])

      // Get edges between relevant nodes
      const relevantEdges = edges.filter(edge => 
        relevantNodes.has(edge.from) && relevantNodes.has(edge.to)
      )

      const newInsights = await analysisService.analyzeGraphSection(
        Array.from(relevantNodes),
        relevantEdges
      )

      setInsights(newInsights)
    } catch (e) {
      setError(e.message)
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
    backgroundColor: colors.palette.neutral100,
    borderRadius: 8,
    margin: 8,
  },
  message: {
    color: colors.palette.neutral600,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: colors.palette.neutral600,
  },
  error: {
    color: colors.palette.angry500,
    marginTop: 8,
  },
  insightsContainer: {
    marginTop: 16,
    maxHeight: 400,
  },
  insightCard: {
    backgroundColor: colors.palette.neutral200,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.palette.neutral800,
    marginBottom: 8,
  },
  confidence: {
    color: colors.palette.neutral600,
    marginBottom: 8,
  },
  reasoningTitle: {
    fontWeight: 'bold',
    color: colors.palette.neutral800,
    marginBottom: 4,
  },
  reasoningStep: {
    color: colors.palette.neutral700,
    marginBottom: 2,
    paddingLeft: 8,
  },
  nodesTitle: {
    fontWeight: 'bold',
    color: colors.palette.neutral800,
    marginTop: 8,
    marginBottom: 4,
  },
  nodes: {
    color: colors.palette.neutral600,
  },
})