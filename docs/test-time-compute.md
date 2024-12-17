# Test-Time Compute for Graph Insights

## Overview

Test-time compute (TTC) scaling allows language models to "think longer" about complex problems by allocating additional compute at inference time. For WhatTheDrone's knowledge graph, we can use Llama 3.2 3B to analyze connections between nodes and derive higher-level insights by giving it multiple attempts to reason about the data.

## Simple Implementation

### 1. Basic Approach

Instead of complex beam search or machine learning libraries, we'll use a simple iterative approach:

```typescript
interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata: any;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface GraphInsight {
  description: string;
  confidence: number;
  relatedNodes: string[];
  reasoning: string[];
}

async function analyzeGraphSection(
  nodes: GraphNode[],
  edges: GraphEdge[],
  attempts: number = 8  // Number of reasoning attempts
): Promise<GraphInsight[]> {
  const insights: GraphInsight[] = [];
  
  // Format graph data for the model
  const graphContext = formatGraphForLLM(nodes, edges);
  
  // Make multiple attempts at reasoning
  for (let i = 0; i < attempts; i++) {
    const prompt = `
      Given this section of a knowledge graph about drone activities:
      ${graphContext}
      
      Previous insights found: ${summarizeInsights(insights)}
      
      Attempt ${i + 1}/${attempts}:
      1. What new pattern, connection, or insight do you notice?
      2. Explain your reasoning step by step
      3. Rate your confidence (0-100)
      4. List the specific nodes involved
    `;

    const response = await llamaModel.complete(prompt);
    const newInsight = parseInsightFromResponse(response);
    
    // Only keep insights above confidence threshold
    if (newInsight.confidence > 70) {
      insights.push(newInsight);
    }
  }

  return deduplicateInsights(insights);
}
```

### 2. Example Usage

```typescript
// In GraphView.tsx
function AnalysisPanel({ selectedNodes, surroundingNodes }) {
  const [insights, setInsights] = useState<GraphInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeSelection() {
    setIsAnalyzing(true);
    
    // Get relevant subgraph
    const subgraph = getConnectedSubgraph(selectedNodes, surroundingNodes);
    
    // Run multiple analysis attempts
    const newInsights = await analyzeGraphSection(
      subgraph.nodes,
      subgraph.edges,
      8  // Start with 8 attempts
    );
    
    setInsights(newInsights);
    setIsAnalyzing(false);
  }

  return (
    <View>
      <Button 
        title="Analyze Connections" 
        onPress={analyzeSelection}
        disabled={isAnalyzing}
      />
      <InsightsList insights={insights} />
    </View>
  );
}
```

### 3. Prompt Engineering

The key is crafting good prompts that:

1. Present the graph data clearly:
```typescript
function formatGraphForLLM(nodes: GraphNode[], edges: GraphEdge[]): string {
  return `
    Nodes:
    ${nodes.map(n => `- ${n.label} (${n.type}): ${n.metadata.description || ''}`).join('\n')}

    Connections:
    ${edges.map(e => {
      const from = nodes.find(n => n.id === e.from);
      const to = nodes.find(n => n.id === e.to);
      return `- ${from.label} ${e.type} ${to.label}`;
    }).join('\n')}
  `;
}
```

2. Guide the model's reasoning:
```typescript
function buildPrompt(context: string, attempt: number): string {
  return `
    You are analyzing a knowledge graph about drone activities.
    Focus on finding non-obvious connections and patterns.
    
    Graph context:
    ${context}
    
    Think step by step:
    1. What entities are most connected?
    2. Are there temporal patterns?
    3. Are there geographic patterns?
    4. What unusual connections stand out?
    5. What might this suggest about drone activities?
    
    Provide your insight in this format:
    INSIGHT: [one sentence description]
    REASONING: [numbered steps]
    CONFIDENCE: [0-100]
    NODES: [list of involved node IDs]
  `;
}
```

## Performance Considerations

1. **Batching**
   - Analyze small subgraphs at a time
   - Focus on selected nodes and immediate connections
   - Cache analysis results for common patterns

2. **Progressive Enhancement**
   - Start with 4-8 reasoning attempts
   - Allow user to request additional attempts
   - Save high-confidence insights locally

3. **Resource Management**
   - Run analysis in background
   - Implement timeout limits
   - Cancel analysis if user navigates away

## Implementation Phases

1. **Phase 1: Basic Analysis**
   - Implement single-pass analysis
   - Add basic insight display
   - Cache results locally

2. **Phase 2: Multiple Attempts**
   - Add multiple reasoning attempts
   - Implement confidence scoring
   - Add insight deduplication

3. **Phase 3: Optimization**
   - Add background processing
   - Implement caching strategy
   - Add user controls for analysis depth

This simplified approach leverages Llama 3.2 3B's capabilities while staying within mobile resource constraints. By making multiple attempts at reasoning about the graph data, we can achieve some of the benefits of test-time compute scaling without implementing complex search algorithms or requiring additional ML libraries.