# Test-Time Compute Implementation Guide

## Overview

This document explains how we implemented test-time compute (TTC) for graph analysis in WhatTheDrone using Llama 3.2 3B. Instead of complex beam search and process reward models, we use a simpler approach that still captures the key benefits of TTC by making multiple attempts at analyzing graph sections.

## Core Concept

The key insight from the HuggingFace article is that even small models can perform well if given multiple attempts to reason about a problem. We apply this by:

1. Taking a section of the knowledge graph
2. Making multiple attempts at analyzing it
3. Keeping high-confidence insights
4. Deduplicating similar findings

This gives us many benefits of test-time compute while staying within mobile constraints.

## Implementation Files

### 1. Graph Analysis Service
`app/services/graph-analysis.ts`

```typescript
export class GraphAnalysisService {
  constructor(
    context: LlamaContext,
    config: {
      attempts?: number      // Number of analysis attempts
      temperature?: number   // Sampling temperature
      maxTokens?: number    // Max tokens per completion
    }
  )
}
```

Key methods:
- `formatGraphForLLM()` - Formats nodes and edges for the model
- `buildPrompt()` - Creates structured prompts for analysis
- `analyzeGraphSection()` - Makes multiple analysis attempts
- `parseInsightFromResponse()` - Extracts structured insights
- `deduplicateInsights()` - Removes similar findings

### 2. Type Definitions  
`app/types/graph.ts`

```typescript
interface GraphNode {
  id: string
  type: 'source' | 'person' | 'organization' | 'place' | 'event' | 'claim' | 'topic' | 'theory'
  label: string
  metadata?: {...}
}

interface GraphEdge {
  from: string
  to: string
  type: 'mentions' | 'claims' | 'located_in' | 'works_for' | 'related_to' | 'supports' | 'opposes'
  metadata?: {...}
}

interface GraphInsight {
  description: string
  reasoning: string[]
  confidence: number
  relatedNodes: string[]
}
```

### 3. Analysis Panel Component
`app/components/GraphAnalysisPanel.tsx`

React Native component that:
- Takes selected nodes and edges as input
- Manages analysis state
- Displays insights with confidence scores
- Handles loading and error states

## How It Works

### 1. Prompt Engineering

Instead of a process reward model, we use carefully structured prompts:

```typescript
const ANALYSIS_SYSTEM_PROMPT = \`You are analyzing a knowledge graph about drone activities.
Focus on finding non-obvious connections and patterns.
Think carefully and explain your reasoning step by step.
Format your response exactly as requested.\`

// Format graph data clearly
\`
Nodes:
- Node 1 (person): Description...
- Node 2 (place): Description...

Connections:
- Node 1 mentions Node 2
- Node 2 located_in Node 3
\`

// Guide reasoning process
\`
Think step by step:
1. What entities are most connected?
2. Are there temporal patterns?
3. Are there geographic patterns?
4. What unusual connections stand out?
5. What might this suggest about drone activities?
\`

// Request structured output
\`
INSIGHT: [one sentence description]
REASONING: [numbered steps]
CONFIDENCE: [0-100]
NODES: [list of involved node IDs]
\`
```

### 2. Multiple Analysis Attempts

For each graph section:
1. Make 8 attempts at analysis (configurable)
2. Keep insights with >70% confidence
3. Track previous insights to encourage diversity
4. Deduplicate similar findings

### 3. Integration with Llama.rn

Uses the same completion interface as the chat example:

```typescript
context.completion(
  {
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    n_predict: 1000,
  },
  (data) => {
    response += data.token
  }
)
```

### 4. Mobile Performance

Optimizations for mobile:
- Analyze small subgraphs at a time
- Focus on selected nodes + immediate connections
- Clear prompt structure for efficient processing
- Configurable number of attempts

## Usage Example

```typescript
// 1. Create analysis service
const analysisService = new GraphAnalysisService(llamaContext, {
  attempts: 8,
  temperature: 0.7
})

// 2. Get relevant subgraph
const relevantNodes = new Set([...selectedNodes, ...surroundingNodes])
const relevantEdges = edges.filter(edge => 
  relevantNodes.has(edge.from) && relevantNodes.has(edge.to)
)

// 3. Run analysis
const insights = await analysisService.analyzeGraphSection(
  Array.from(relevantNodes),
  relevantEdges
)

// 4. Display results
<GraphAnalysisPanel
  selectedNodes={selectedNodes}
  surroundingNodes={surroundingNodes}
  edges={edges}
  llamaContext={context}
/>
```

## Differences from Original Paper

1. **Simplified Search Strategy**
   - Original: Complex beam search with PRM
   - Ours: Multiple independent attempts
   - Why: Simpler to implement, still effective

2. **Quality Control**
   - Original: PRM scores each step
   - Ours: Confidence scores + deduplication
   - Why: Works well with single model

3. **Mobile Optimization**
   - Original: Server-side processing
   - Ours: On-device with Llama 3.2 3B
   - Why: Better privacy, offline capability

4. **Prompt Engineering**
   - Original: Separate policy and reward models
   - Ours: Single model with structured prompts
   - Why: Simpler architecture, clear outputs

## Future Improvements

1. **Enhanced Prompting**
   - Add more domain-specific reasoning steps
   - Experiment with different prompt structures
   - Fine-tune confidence thresholds

2. **Performance Optimization**
   - Cache common analysis patterns
   - Implement progressive loading
   - Add background processing

3. **User Interface**
   - Add insight filtering options
   - Visualize reasoning chains
   - Show confidence distributions

4. **Analysis Quality**
   - Track insight accuracy over time
   - Allow user feedback/corrections
   - Implement cross-validation

## Conclusion

This implementation shows how to get the benefits of test-time compute scaling while staying within mobile constraints. By focusing on clear prompting and multiple attempts rather than complex search strategies, we can achieve good results with a single on-device model.