import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const kirbyData: GraphData = {
  nodes: [
    // Source document
    {
      id: 'kirby_interview_1',
      type: 'source',
      label: 'Kirby Interview on Drone Assessment',
      position: new Vector3(10, 0, 0),
      metadata: {
        date: '2024-12-16',
        author: 'John Kirby'
      }
    },

    // Organizations
    {
      id: 'faa',
      type: 'organization',
      label: 'Federal Aviation Administration',
      position: generatePosition(12, 14, 3)
    },

    // Topics
    {
      id: 'drone_registration',
      type: 'topic',
      label: 'Drone Registration',
      position: generatePosition(6, 8, 7)
    },
    {
      id: 'legal_assessment',
      type: 'topic',
      label: 'Legal Assessment',
      position: generatePosition(7, 8, 7)
    },
    {
      id: 'sighting_count',
      type: 'topic',
      label: '5,000 Sightings Examined',
      position: generatePosition(8, 8, 7)
    },

    // Claims
    {
      id: 'claim_legal_activity',
      type: 'claim',
      label: 'All Activity is Legal',
      position: generatePosition(9, 10, 7)
    },
    {
      id: 'claim_million_drones',
      type: 'claim',
      label: 'Over Million Registered Drones',
      position: generatePosition(10, 10, 7)
    }
  ],
  
  edges: [
    // Source connections
    { id: 'e70', from: 'kirby_interview_1', to: 'kirby', type: 'mentions', sourceId: 'kirby_interview_1' },
    { id: 'e71', from: 'kirby_interview_1', to: 'faa', type: 'mentions', sourceId: 'kirby_interview_1' },
    { id: 'e72', from: 'kirby_interview_1', to: 'commercial_drones', type: 'mentions', sourceId: 'kirby_interview_1' },
    { id: 'e73', from: 'kirby_interview_1', to: 'law_enforcement', type: 'mentions', sourceId: 'kirby_interview_1' },
    
    // Claims
    { id: 'e74', from: 'kirby', to: 'claim_legal_activity', type: 'claims', sourceId: 'kirby_interview_1' },
    { id: 'e75', from: 'kirby', to: 'claim_million_drones', type: 'claims', sourceId: 'kirby_interview_1' },
    { id: 'e76', from: 'kirby', to: 'sighting_count', type: 'claims', sourceId: 'kirby_interview_1' },
    
    // Topic relationships
    { id: 'e77', from: 'faa', to: 'drone_registration', type: 'related_to', sourceId: 'kirby_interview_1' },
    { id: 'e78', from: 'claim_legal_activity', to: 'legal_assessment', type: 'supports', sourceId: 'kirby_interview_1' },
    { id: 'e79', from: 'claim_million_drones', to: 'drone_registration', type: 'supports', sourceId: 'kirby_interview_1' },
    
    // Support for theories
    { id: 'e80', from: 'legal_assessment', to: 'theory_misidentification', type: 'supports', sourceId: 'kirby_interview_1' },
    { id: 'e81', from: 'sighting_count', to: 'drone_sightings', type: 'related_to', sourceId: 'kirby_interview_1' }
  ]
};