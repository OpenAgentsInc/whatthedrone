# WhatTheDrone Project Structure

```
whatthedrone/
├── app/
│   ├── _layout.tsx        # Root layout component with navigation setup
│   └── index.tsx         # Main home screen
│
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   │
│   └── images/
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
│
├── components/
│   ├── GraphCanvas.tsx    # Main graph canvas component
│   ├── GraphView.tsx      # Graph view wrapper component
│   ├── NodeDetail.tsx     # Node detail display component
│   ├── TextSprite.ts      # Text sprite implementation
│   └── graph/
│       ├── GraphCanvas.tsx
│       ├── Scene.ts
│       ├── types.ts
│       ├── core/
│       │   ├── Scene.ts
│       │   └── TextSprite.ts
│       ├── hooks/
│       │   ├── useAnimation.ts
│       │   └── useCleanup.ts
│       └── utils/
│           ├── coordinates.ts
│           └── types.ts
│
├── data/
│   ├── graph.ts          # Graph data structures
│   └── initial-graph.ts  # Initial graph state
│
├── docs/
│   └── hierarchy.md      # This file - project structure documentation
│
├── sources/
│   └── telegraph-mayorkas-drone-powers.md  # Source material
│
├── types/
│   ├── canvas.ts         # Canvas-related type definitions
│   └── graph.ts          # Graph-related type definitions
│
├── .gitignore           # Git ignore rules
├── app.json            # Expo app configuration
├── package.json        # Node.js dependencies and scripts
├── README.md          # Project documentation
├── tsconfig.json      # TypeScript configuration
└── yarn.lock          # Locked versions of dependencies
```

## Directory Overview

### `/app`
Contains the main application code using Expo Router for navigation:
- `_layout.tsx`: Root layout component that sets up navigation
- `index.tsx`: Main home screen of the application

### `/assets`
Static assets used in the application:
- `/fonts`: Custom fonts used in the app
- `/images`: App icons, splash screens, and other images

### `/components`
React components and related utilities:
- Root components for graph visualization
- Nested graph-specific components and utilities in `/graph`
- Custom hooks for animation and cleanup
- Core implementations for Scene and TextSprite
- Utility functions for coordinates and types

### `/data`
Data structures and initial state:
- `graph.ts`: Graph data structure definitions
- `initial-graph.ts`: Initial graph state configuration

### `/docs`
Project documentation:
- `hierarchy.md`: This file documenting the project structure

### `/sources`
Source material and references:
- `telegraph-mayorkas-drone-powers.md`: Reference material

### `/types`
TypeScript type definitions:
- `canvas.ts`: Canvas-related types
- `graph.ts`: Graph-related types

### Root Files
- `.gitignore`: Specifies which files Git should ignore
- `app.json`: Expo configuration file for the app
- `package.json`: Node.js project configuration and dependencies
- `yarn.lock`: Locked versions of yarn dependencies
- `README.md`: Main project documentation
- `tsconfig.json`: TypeScript compiler configuration