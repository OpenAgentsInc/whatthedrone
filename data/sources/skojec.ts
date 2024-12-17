import { Vector3 } from 'three';
import { GraphData } from '../types';
import { generatePosition } from '../utils';

export const skojecData: GraphData = {
  nodes: [
    // Source document
    {
      id: 'skojec_article_1',
      type: 'source',
      label: 'Skojec: Why I Don\'t Believe the "Drones" Are Looking for Nuclear or Bioweapons',
      position: new Vector3(4, 0, 0),
      metadata: {
        date: '2024-12-16',
        author: 'Steve Skojec',
        url: 'https://skojec.substack.com'
      }
    },

    // People
    {
      id: 'van_drew',
      type: 'person',
      label: 'Jeff Van Drew',
      position: generatePosition(5, 12, 3),
      metadata: {
        role: 'Congressman from New Jersey'
      }
    },
    {
      id: 'ferguson',
      type: 'person',
      label: 'John Ferguson',
      position: generatePosition(6, 12, 3),
      metadata: {
        role: 'CEO of Saxon Aerospace'
      }
    },
    {
      id: 'graves',
      type: 'person',
      label: 'Ryan Graves',
      position: generatePosition(7, 12, 3),
      metadata: {
        role: 'Former Navy F/A-18 pilot'
      }
    },
    {
      id: 'coulthart',
      type: 'person',
      label: 'Ross Coulthart',
      position: generatePosition(8, 12, 3),
      metadata: {
        role: 'Investigative journalist'
      }
    },

    // Organizations
    {
      id: 'fbi',
      type: 'organization',
      label: 'FBI',
      position: generatePosition(9, 12, 3)
    },
    {
      id: 'pentagon',
      type: 'organization',
      label: 'Pentagon',
      position: generatePosition(10, 12, 3)
    },
    {
      id: 'saxon_aerospace',
      type: 'organization',
      label: 'Saxon Aerospace',
      position: generatePosition(11, 12, 3),
      metadata: {
        location: 'Wichita, Kansas'
      }
    },

    // Places
    {
      id: 'picatinny_arsenal',
      type: 'place',
      label: 'Picatinny Arsenal',
      position: generatePosition(0, 6, 7),
      metadata: {
        description: 'Military installation with confirmed sightings'
      }
    },
    {
      id: 'naval_weapons_earle',
      type: 'place',
      label: 'Naval Weapons Station Earle',
      position: generatePosition(1, 6, 7)
    },
    {
      id: 'wright_patterson',
      type: 'place',
      label: 'Wright-Patterson Air Force Base',
      position: generatePosition(2, 6, 7)
    },

    // Topics
    {
      id: 'nuclear_search',
      type: 'topic',
      label: 'Nuclear Material Search Theory',
      position: generatePosition(3, 6, 7)
    },
    {
      id: 'iran_theory',
      type: 'topic',
      label: 'Iranian Mothership Theory',
      position: generatePosition(4, 6, 7)
    },
    {
      id: 'containment_narrative',
      type: 'topic',
      label: 'Containment Narrative',
      position: generatePosition(5, 6, 7)
    }
  ],
  
  edges: [
    // Source connections
    { id: 'e24', from: 'skojec_article_1', to: 'van_drew', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e25', from: 'skojec_article_1', to: 'ferguson', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e26', from: 'skojec_article_1', to: 'graves', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e27', from: 'skojec_article_1', to: 'coulthart', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e28', from: 'skojec_article_1', to: 'fbi', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e29', from: 'skojec_article_1', to: 'pentagon', type: 'mentions', sourceId: 'skojec_article_1' },
    
    // Location mentions
    { id: 'e30', from: 'skojec_article_1', to: 'picatinny_arsenal', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e31', from: 'skojec_article_1', to: 'naval_weapons_earle', type: 'mentions', sourceId: 'skojec_article_1' },
    { id: 'e32', from: 'skojec_article_1', to: 'wright_patterson', type: 'mentions', sourceId: 'skojec_article_1' },
    
    // Topic relationships
    { id: 'e33', from: 'skojec_article_1', to: 'nuclear_search', type: 'opposes', sourceId: 'skojec_article_1' },
    { id: 'e34', from: 'skojec_article_1', to: 'iran_theory', type: 'opposes', sourceId: 'skojec_article_1' },
    { id: 'e35', from: 'van_drew', to: 'iran_theory', type: 'supports', sourceId: 'skojec_article_1' },
    { id: 'e36', from: 'pentagon', to: 'iran_theory', type: 'opposes', sourceId: 'skojec_article_1' },
    { id: 'e37', from: 'ferguson', to: 'nuclear_search', type: 'supports', sourceId: 'skojec_article_1' },
    { id: 'e38', from: 'graves', to: 'nuclear_search', type: 'opposes', sourceId: 'skojec_article_1' },
    { id: 'e39', from: 'coulthart', to: 'nuclear_search', type: 'opposes', sourceId: 'skojec_article_1' },
    
    // Organizational relationships
    { id: 'e40', from: 'ferguson', to: 'saxon_aerospace', type: 'works_for', sourceId: 'skojec_article_1' },
    
    // Military base connections
    { id: 'e41', from: 'picatinny_arsenal', to: 'drone_sightings', type: 'related_to', sourceId: 'skojec_article_1' },
    { id: 'e42', from: 'naval_weapons_earle', to: 'drone_sightings', type: 'related_to', sourceId: 'skojec_article_1' },
    { id: 'e43', from: 'wright_patterson', to: 'drone_sightings', type: 'related_to', sourceId: 'skojec_article_1' },
    
    // Containment narrative
    { id: 'e44', from: 'nuclear_search', to: 'containment_narrative', type: 'related_to', sourceId: 'skojec_article_1' },
    { id: 'e45', from: 'iran_theory', to: 'containment_narrative', type: 'related_to', sourceId: 'skojec_article_1' }
  ]
};