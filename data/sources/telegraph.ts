import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const telegraphData: GraphData = {
  nodes: [
    // Source document
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

    // People
    {
      id: 'mayorkas',
      type: 'person',
      label: 'Alejandro Mayorkas',
      position: generatePosition(0, 8, 3),
      metadata: {
        role: 'Homeland Security Secretary'
      }
    },
    {
      id: 'hochul',
      type: 'person',
      label: 'Kathy Hochul',
      position: generatePosition(1, 8, 3),
      metadata: {
        role: 'New York Governor'
      }
    },
    {
      id: 'christie',
      type: 'person',
      label: 'Chris Christie',
      position: generatePosition(2, 8, 3),
      metadata: {
        role: 'Former New Jersey Governor'
      }
    },
    {
      id: 'biden',
      type: 'person',
      label: 'Joe Biden',
      position: generatePosition(3, 8, 3),
      metadata: {
        role: 'President'
      }
    },

    // Organizations
    {
      id: 'dhs',
      type: 'organization',
      label: 'Department of Homeland Security',
      position: generatePosition(4, 8, 3)
    },
    {
      id: 'secret_service',
      type: 'organization',
      label: 'US Secret Service',
      position: generatePosition(5, 8, 3)
    },

    // Places
    {
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart International Airport',
      position: generatePosition(6, 8, 3),
      metadata: {
        location: '60 miles north of New York City'
      }
    },
    {
      id: 'east_coast',
      type: 'place',
      label: 'East Coast',
      position: generatePosition(7, 8, 3)
    },

    // Topics
    {
      id: 'drone_sightings',
      type: 'topic',
      label: 'Drone Sightings',
      position: generatePosition(0, 4, 5)
    },
    {
      id: 'drone_powers',
      type: 'topic',
      label: 'Drone Countermeasure Powers',
      position: generatePosition(1, 4, 5)
    }
  ],
  
  edges: [
    // Source connections
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
    { id: 'e12', from: 'drone_sightings', to: 'stewart_airport', type: 'related_to', sourceId: 'telegraph_article_1' }
  ]
};