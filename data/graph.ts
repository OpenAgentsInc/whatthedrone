import { GraphData } from './types';
import { telegraphData } from './sources/telegraph';
import { whiteHouseData } from './sources/white-house';
import { skojecData } from './sources/skojec';

// Merge all nodes and edges from different sources
function mergeGraphData(...graphDatas: GraphData[]): GraphData {
  const nodes = new Map();
  const edges = new Map();

  // Merge all nodes and edges, with later sources overwriting earlier ones
  for (const data of graphDatas) {
    for (const node of data.nodes) {
      nodes.set(node.id, node);
    }
    for (const edge of data.edges) {
      edges.set(edge.id, edge);
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values())
  };
}

// Export the combined graph data
export const INITIAL_GRAPH_DATA = mergeGraphData(
  telegraphData,
  whiteHouseData,
  skojecData
);