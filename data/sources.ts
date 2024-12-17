import { Vector3 } from 'three';
import { GraphData, Node, Edge } from './types';

export interface Source {
  id: string;
  filename: string;
  title: string;
  date: string;
  author: string;
  url?: string;
  content: string;
}

export interface EntityExtraction {
  entities: {
    people: string[];
    organizations: string[];
    places: string[];
    topics: string[];
    theories: string[];
    claims: string[];
  };
  relationships: Array<{
    from: string;
    to: string;
    type: string;
    description?: string;
  }>;
}

// Function to load and parse a markdown source file
export async function loadSource(filename: string): Promise<Source> {
  // TODO: Implement markdown file loading
  return {} as Source;
}

// Function to extract entities and relationships from source content
export async function extractEntities(source: Source): Promise<EntityExtraction> {
  // TODO: Implement entity extraction (possibly using LLM)
  return {
    entities: {
      people: [],
      organizations: [],
      places: [],
      topics: [],
      theories: [],
      claims: []
    },
    relationships: []
  };
}

// Function to merge a new source into existing graph data
export function mergeSourceIntoGraph(
  source: Source, 
  extraction: EntityExtraction, 
  existingGraph: GraphData
): GraphData {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];
  
  // Add source node
  newNodes.push({
    id: source.id,
    type: 'source',
    label: source.title,
    position: new Vector3(0, 0, 0), // Will be repositioned
    metadata: {
      date: source.date,
      author: source.author,
      url: source.url
    }
  });

  // TODO: Process extracted entities and create nodes
  // TODO: Process relationships and create edges
  // TODO: Update positions of all nodes
  
  return {
    nodes: [...existingGraph.nodes, ...newNodes],
    edges: [...existingGraph.edges, ...newEdges]
  };
}

// Function to load all sources and build complete graph
export async function buildCompleteGraph(): Promise<GraphData> {
  const sourceFiles = [
    'telegraph-mayorkas-drone-powers.md',
    'white-house-statement.md',
    'skojec-article.md',
    'schumer-interview.md',
    'trump-comments.md',
    'kirby-interview.md'
  ];

  let graph: GraphData = {
    nodes: [],
    edges: []
  };

  for (const filename of sourceFiles) {
    const source = await loadSource(filename);
    const extraction = await extractEntities(source);
    graph = mergeSourceIntoGraph(source, extraction, graph);
  }

  return graph;
}

// Export source data
export * from './sources/telegraph';
export * from './sources/white-house';
export * from './sources/skojec';
export * from './sources/schumer';
export * from './sources/trump';
export * from './sources/kirby';