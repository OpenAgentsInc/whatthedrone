import { Vector3 } from 'three';

// Types for our graph data
export interface Node {
  id: string;
  type: 'source' | 'person' | 'organization' | 'place' | 'event' | 'claim' | 'topic' | 'theory';
  label: string;
  position: Vector3;
  sourceId?: string; // Reference to source document if entity was first mentioned there
  metadata?: {
    date?: string;
    url?: string;
    author?: string;
    role?: string;
    location?: string;
    description?: string;
  };
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: 'mentions' | 'claims' | 'located_in' | 'works_for' | 'related_to' | 'supports' | 'opposes';
  sourceId: string; // Which source document established this relationship
  metadata?: {
    date?: string;
    description?: string;
  };
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Function to generate positions for nodes
function generatePosition(index: number, total: number, radius: number = 5): Vector3 {
  const angle = (index / total) * Math.PI * 2;
  return new Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    0
  );
}

// Initial graph data from telegraph-mayorkas-drone-powers.md
export const INITIAL_GRAPH_DATA: GraphData = {
  nodes: [
    // Source documents
    {
      id: 'telegraph_article_1',
      type: 'source',
      label: 'Telegraph: Give states power to shoot down drones',
      position: new Vector3(0, 0, 0),
      metadata: {
        date: '2024-12-15',
        author: 'Benedict Smith',
        url: '[Telegraph Article]'
      }
    },
    {
      id: 'white_house_statement_1',
      type: 'source',
      label: 'White House Statement on Drone Sightings',
      position: new Vector3(2, 0, 0),
      metadata: {
        date: '2024-12-16',
        url: 'https://x.com/UAPJames/status/1868794505769709748'
      }
    },

    // People
    {
      id: 'mayorkas',
      type: 'person',
      label: 'Alejandro Mayorkas',
      position: generatePosition(0, 9, 3),
      metadata: {
        role: 'Homeland Security Secretary'
      }
    },
    {
      id: 'hochul',
      type: 'person',
      label: 'Kathy Hochul',
      position: generatePosition(1, 9, 3),
      metadata: {
        role: 'New York Governor'
      }
    },
    {
      id: 'christie',
      type: 'person',
      label: 'Chris Christie',
      position: generatePosition(2, 9, 3),
      metadata: {
        role: 'Former New Jersey Governor'
      }
    },
    {
      id: 'biden',
      type: 'person',
      label: 'Joe Biden',
      position: generatePosition(3, 9, 3),
      metadata: {
        role: 'President'
      }
    },
    {
      id: 'kirby',
      type: 'person',
      label: 'John Kirby',
      position: generatePosition(4, 9, 3),
      metadata: {
        role: 'White House National Security Council Coordinator'
      }
    },

    // Organizations
    {
      id: 'dhs',
      type: 'organization',
      label: 'Department of Homeland Security',
      position: generatePosition(5, 9, 3)
    },
    {
      id: 'secret_service',
      type: 'organization',
      label: 'US Secret Service',
      position: generatePosition(6, 9, 3)
    },
    {
      id: 'law_enforcement',
      type: 'organization',
      label: 'Law Enforcement Agencies',
      position: generatePosition(7, 9, 3)
    },

    // Places
    {
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart International Airport',
      position: generatePosition(8, 9, 3),
      metadata: {
        location: '60 miles north of New York City'
      }
    },
    {
      id: 'east_coast',
      type: 'place',
      label: 'East Coast',
      position: generatePosition(0, 5, 5)
    },
    {
      id: 'new_jersey',
      type: 'place',
      label: 'New Jersey',
      position: generatePosition(1, 5, 5)
    },

    // Topics
    {
      id: 'drone_sightings',
      type: 'topic',
      label: 'Drone Sightings',
      position: generatePosition(2, 5, 5)
    },
    {
      id: 'drone_powers',
      type: 'topic',
      label: 'Drone Countermeasure Powers',
      position: generatePosition(3, 5, 5)
    },
    {
      id: 'commercial_drones',
      type: 'topic',
      label: 'Commercial Drones',
      position: generatePosition(4, 5, 5)
    },

    // Theories
    {
      id: 'theory_china',
      type: 'theory',
      label: 'Chinese Origin Theory',
      position: generatePosition(0, 4, 7)
    },
    {
      id: 'theory_russia',
      type: 'theory',
      label: 'Russian Origin Theory',
      position: generatePosition(1, 4, 7)
    },
    {
      id: 'theory_misidentification',
      type: 'theory',
      label: 'Misidentification Theory',
      position: generatePosition(2, 4, 7)
    }
  ],
  
  edges: [
    // Source connections - Telegraph article
    { id: 'e1', from: 'telegraph_article_1', to: 'mayorkas', type: 'mentions', sourceId: 'telegraph_article_1' },
    { id: 'e2', from: 'telegraph_article_1', to: 'hochul', type: 'mentions', sourceId: 'telegraph_article_1' },
    { id: 'e3', from: 'telegraph_article_1', to: 'christie', type: 'mentions', sourceId: 'telegraph_article_1' },
    { id: 'e4', from: 'telegraph_article_1', to: 'biden', type: 'mentions', sourceId: 'telegraph_article_1' },
    
    // Organizational relationships
    { id: 'e5', from: 'mayorkas', to: 'dhs', type: 'works_for', sourceId: 'telegraph_article_1' },
    { id: 'e6', from: 'secret_service', to: 'dhs', type: 'related_to', sourceId: 'telegraph_article_1' },
    
    // Topic relationships
    { id: 'e7', from: 'mayorkas', to: 'drone_powers', type: 'supports', sourceId: 'telegraph_article_1' },
    { id: 'e8', from: 'hochul', to: 'drone_powers', type: 'supports', sourceId: 'telegraph_article_1' },
    { id: 'e9', from: 'christie', to: 'drone_powers', type: 'supports', sourceId: 'telegraph_article_1' },
    
    // Location relationships
    { id: 'e10', from: 'stewart_airport', to: 'east_coast', type: 'located_in', sourceId: 'telegraph_article_1' },
    { id: 'e11', from: 'drone_sightings', to: 'east_coast', type: 'related_to', sourceId: 'telegraph_article_1' },
    
    // Event connections
    { id: 'e12', from: 'drone_sightings', to: 'stewart_airport', type: 'related_to', sourceId: 'telegraph_article_1' },
    
    // Theory connections
    { id: 'e13', from: 'drone_sightings', to: 'theory_china', type: 'related_to', sourceId: 'telegraph_article_1' },
    { id: 'e14', from: 'drone_sightings', to: 'theory_russia', type: 'related_to', sourceId: 'telegraph_article_1' },

    // White House Statement connections
    { id: 'e15', from: 'white_house_statement_1', to: 'kirby', type: 'mentions', sourceId: 'white_house_statement_1' },
    { id: 'e16', from: 'white_house_statement_1', to: 'new_jersey', type: 'mentions', sourceId: 'white_house_statement_1' },
    { id: 'e17', from: 'white_house_statement_1', to: 'commercial_drones', type: 'mentions', sourceId: 'white_house_statement_1' },
    { id: 'e18', from: 'white_house_statement_1', to: 'law_enforcement', type: 'mentions', sourceId: 'white_house_statement_1' },
    { id: 'e19', from: 'white_house_statement_1', to: 'theory_misidentification', type: 'supports', sourceId: 'white_house_statement_1' },
    { id: 'e20', from: 'kirby', to: 'theory_misidentification', type: 'supports', sourceId: 'white_house_statement_1' },
    { id: 'e21', from: 'commercial_drones', to: 'drone_sightings', type: 'related_to', sourceId: 'white_house_statement_1' },
    { id: 'e22', from: 'law_enforcement', to: 'drone_sightings', type: 'related_to', sourceId: 'white_house_statement_1' },
    { id: 'e23', from: 'new_jersey', to: 'east_coast', type: 'located_in', sourceId: 'white_house_statement_1' }
  ]
};