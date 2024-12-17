import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const trumpData: GraphData = {
  nodes: [
    // Source document
    {
      id: 'trump_interview_1',
      type: 'source',
      label: 'Trump Comments on NJ Drone Activity',
      position: new Vector3(8, 0, 0),
      metadata: {
        date: '2024-12-16',
        author: 'Donald Trump'
      }
    },

    // People
    {
      id: 'trump',
      type: 'person',
      label: 'Donald Trump',
      position: generatePosition(11, 12, 3),
      metadata: {
        role: 'Former President'
      }
    },

    // Places
    {
      id: 'bedminster',
      type: 'place',
      label: 'Bedminster',
      position: generatePosition(3, 6, 7),
      metadata: {
        location: 'New Jersey'
      }
    },

    // Topics
    {
      id: 'government_knowledge',
      type: 'topic',
      label: 'Government Knowledge Claims',
      position: generatePosition(7, 8, 7)
    },
    {
      id: 'takeoff_locations',
      type: 'topic',
      label: 'Drone Takeoff Locations',
      position: generatePosition(8, 8, 7)
    },

    // Claims
    {
      id: 'claim_military_knows',
      type: 'claim',
      label: 'Military Knows Origins',
      position: generatePosition(9, 10, 7)
    },
    {
      id: 'claim_not_enemy',
      type: 'claim',
      label: 'Not Enemy Activity',
      position: generatePosition(10, 10, 7)
    }
  ],
  
  edges: [
    // Source connections
    { id: 'e60', from: 'trump_interview_1', to: 'trump', type: 'mentions', sourceId: 'trump_interview_1' },
    { id: 'e61', from: 'trump_interview_1', to: 'bedminster', type: 'mentions', sourceId: 'trump_interview_1' },
    { id: 'e62', from: 'trump_interview_1', to: 'us_military', type: 'mentions', sourceId: 'trump_interview_1' },
    
    // Location relationships
    { id: 'e63', from: 'bedminster', to: 'new_jersey', type: 'located_in', sourceId: 'trump_interview_1' },
    { id: 'e64', from: 'drone_sightings', to: 'bedminster', type: 'related_to', sourceId: 'trump_interview_1' },
    
    // Claims
    { id: 'e65', from: 'trump', to: 'claim_military_knows', type: 'claims', sourceId: 'trump_interview_1' },
    { id: 'e66', from: 'trump', to: 'claim_not_enemy', type: 'claims', sourceId: 'trump_interview_1' },
    { id: 'e67', from: 'us_military', to: 'takeoff_locations', type: 'related_to', sourceId: 'trump_interview_1' },
    { id: 'e68', from: 'claim_military_knows', to: 'government_knowledge', type: 'supports', sourceId: 'trump_interview_1' },
    { id: 'e69', from: 'claim_not_enemy', to: 'theory_misidentification', type: 'opposes', sourceId: 'trump_interview_1' }
  ]
};