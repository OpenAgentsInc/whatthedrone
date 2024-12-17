import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const whiteHouseData: GraphData = {
  nodes: [
    // Source document
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
      id: 'law_enforcement',
      type: 'organization',
      label: 'Law Enforcement Agencies',
      position: generatePosition(7, 9, 3)
    },

    // Places
    {
      id: 'new_jersey',
      type: 'place',
      label: 'New Jersey',
      position: generatePosition(1, 5, 5)
    },

    // Topics
    {
      id: 'commercial_drones',
      type: 'topic',
      label: 'Commercial Drones',
      position: generatePosition(4, 5, 5)
    },

    // Theories
    {
      id: 'theory_misidentification',
      type: 'theory',
      label: 'Misidentification Theory',
      position: generatePosition(2, 4, 7)
    }
  ],
  
  edges: [
    // Source connections
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