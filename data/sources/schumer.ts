import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const schumerData: GraphData = {
  nodes: [
    // Source document
    {
      id: 'schumer_interview_1',
      type: 'source',
      label: 'Schumer Interview on Drone Sightings',
      position: new Vector3(6, 0, 0),
      metadata: {
        date: '2024-12-16',
        author: 'Chuck Schumer'
      }
    },

    // People
    {
      id: 'schumer',
      type: 'person',
      label: 'Chuck Schumer',
      position: generatePosition(9, 12, 3),
      metadata: {
        role: 'Senate Majority Leader'
      }
    },

    // Organizations
    {
      id: 'us_military',
      type: 'organization',
      label: 'US Military',
      position: generatePosition(10, 12, 3)
    },

    // Topics
    {
      id: 'uap_investigation',
      type: 'topic',
      label: 'UAP Investigation',
      position: generatePosition(5, 6, 7)
    },
    {
      id: 'military_denial',
      type: 'topic',
      label: 'Military Denial of Involvement',
      position: generatePosition(6, 6, 7)
    }
  ],
  
  edges: [
    // Source connections
    { id: 'e50', from: 'schumer_interview_1', to: 'schumer', type: 'mentions', sourceId: 'schumer_interview_1' },
    { id: 'e51', from: 'schumer_interview_1', to: 'us_military', type: 'mentions', sourceId: 'schumer_interview_1' },
    { id: 'e52', from: 'schumer_interview_1', to: 'uap_investigation', type: 'mentions', sourceId: 'schumer_interview_1' },
    { id: 'e53', from: 'schumer_interview_1', to: 'military_denial', type: 'mentions', sourceId: 'schumer_interview_1' },
    
    // Claims and relationships
    { id: 'e54', from: 'schumer', to: 'uap_investigation', type: 'supports', sourceId: 'schumer_interview_1' },
    { id: 'e55', from: 'us_military', to: 'military_denial', type: 'related_to', sourceId: 'schumer_interview_1' },
    { id: 'e56', from: 'military_denial', to: 'theory_misidentification', type: 'opposes', sourceId: 'schumer_interview_1' }
  ]
};