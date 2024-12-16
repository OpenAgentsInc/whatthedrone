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
├── docs/
│   └── hierarchy.md      # This file - project structure documentation
│
├── .gitignore           # Git ignore rules
├── app.json            # Expo app configuration
├── package.json        # Node.js dependencies and scripts
├── package-lock.json   # Locked versions of dependencies
├── README.md          # Project documentation
└── tsconfig.json      # TypeScript configuration
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

### `/docs`
Project documentation:
- `hierarchy.md`: This file documenting the project structure

### Root Files
- `.gitignore`: Specifies which files Git should ignore
- `app.json`: Expo configuration file for the app
- `package.json`: Node.js project configuration and dependencies
- `package-lock.json`: Locked versions of npm dependencies
- `README.md`: Main project documentation
- `tsconfig.json`: TypeScript compiler configuration