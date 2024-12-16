import { Vector3 } from 'three';

export const INITIAL_GRAPH = {
  nodes: [
    {
      id: 'article',
      type: 'source',
      label: 'Telegraph Article',
      position: new Vector3(0, 0, 0),
    },
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
      id: 'stewart_airport',
      type: 'place',
      label: 'Stewart Airport',
      position: new Vector3(0, 2, 0),
    },
    {
      id: 'drone_powers',
      type: 'concept',
      label: 'State Drone Powers',
      position: new Vector3(-1, -1, 0),
    },
    {
      id: 'runway_closure',
      type: 'event',
      label: 'Runway Closure',
      position: new Vector3(1, -1, 0),
    },
  ],
  edges: [
    { id: 'e1', from: 'article', to: 'mayorkas' },
    { id: 'e2', from: 'article', to: 'hochul' },
    { id: 'e3', from: 'mayorkas', to: 'drone_powers' },
    { id: 'e4', from: 'hochul', to: 'stewart_airport' },
    { id: 'e5', from: 'stewart_airport', to: 'runway_closure' },
  ],
};