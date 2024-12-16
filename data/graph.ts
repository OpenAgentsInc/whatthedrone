import { Vector3 } from 'three';

export const INITIAL_GRAPH_DATA = {
  nodes: [
    {
      id: 'article1',
      type: 'source',
      label: 'Telegraph Article',
      position: new Vector3(0, 0, 0),
    },
    // People
    {
      id: 'mayorkas',
      type: 'person',
      label: 'Alejandro Mayorkas',
      position: new Vector3(-2, 1, 0),
    },
    {
      id: 'hochul',
      type: 'person',
      label: 'Kathy Hochul',
      position: new Vector3(2, 1, 0),
    },
    {
      id: 'christie',
      type: 'person',
      label: 'Chris Christie',
      position: new Vector3(0, 2, 0),
    },
    // Organizations
    {
      id: 'dhs',
      type: 'organization',
      label: 'Department of Homeland Security',
      position: new Vector3(-3, 0, 0),
    },
    {
      id: 'secret_service',
      type: 'organization',
      label: 'US Secret Service',
      position: new Vector3(-3, -1, 0),
    },
    // Places
    {
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart International Airport',
      position: new Vector3(3, 0, 0),
    },
    {
      id: 'east_coast',
      type: 'place',
      label: 'East Coast',
      position: new Vector3(3, -1, 0),
    },
    // Events
    {
      id: 'runway_closure',
      type: 'event',
      label: 'Runway Closure',
      position: new Vector3(1, -2, 0),
    },
    // Claims
    {
      id: 'state_powers',
      type: 'claim',
      label: 'States Need Drone Powers',
      position: new Vector3(-1, -2, 0),
    },
    {
      id: 'foreign_involvement',
      type: 'claim',
      label: 'No Foreign Involvement Known',
      position: new Vector3(0, -3, 0),
    },
  ],
  edges: [
    // Article connections
    { id: 'e1', from: 'article1', to: 'mayorkas' },
    { id: 'e2', from: 'article1', to: 'hochul' },
    { id: 'e3', from: 'article1', to: 'christie' },
    
    // Organizational relationships
    { id: 'e4', from: 'mayorkas', to: 'dhs' },
    { id: 'e5', from: 'dhs', to: 'secret_service' },
    
    // Event connections
    { id: 'e6', from: 'hochul', to: 'stewart_airport' },
    { id: 'e7', from: 'stewart_airport', to: 'runway_closure' },
    
    // Claims and statements
    { id: 'e8', from: 'mayorkas', to: 'state_powers' },
    { id: 'e9', from: 'mayorkas', to: 'foreign_involvement' },
    
    // Location relationships
    { id: 'e10', from: 'stewart_airport', to: 'east_coast' },
  ]
};