# WhatTheDrone Specification

## Overview
WhatTheDrone is a mobile/web app for collecting and querying information about drone sightings and related events. The app implements a simplified version of GraphRAG, representing information as nodes with edges in a local SQLite database, with semantic search capabilities running directly on the device.

## Quick Start
See [Vertical Slice](./vertical-slice.md) for a 5-minute setup guide to get the initial graph visualization working with our first source article.

## Core Features

### 1. Local-First Architecture
- SQLite database using expo-sqlite
- Initial database download on first launch
- Periodic sync with central server (future)
- Offline-capable operation

### 2. Knowledge Graph Structure

#### Node Types
```sql
CREATE TABLE nodes (
    id TEXT PRIMARY KEY,
    type TEXT,           -- 'content' or 'entity'
    content TEXT,        -- raw content or entity name
    metadata TEXT,       -- JSON string containing:
                        -- - timestamp
                        -- - source
                        -- - author
                        -- - links
                        -- - coordinates (if applicable)
    embedding BLOB,      -- vector embedding for semantic search
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE edges (
    id TEXT PRIMARY KEY,
    from_node_id TEXT,
    to_node_id TEXT,
    relationship_type TEXT,
    confidence FLOAT,
    metadata TEXT,       -- JSON string for additional properties
    created_at DATETIME,
    FOREIGN KEY (from_node_id) REFERENCES nodes(id),
    FOREIGN KEY (to_node_id) REFERENCES nodes(id)
);

CREATE TABLE embeddings_cache (
    content_hash TEXT PRIMARY KEY,
    embedding BLOB,
    created_at DATETIME
);
```

### 3. Core Functionality
- Content ingestion with automatic entity extraction
- Local semantic search using device-compatible embedding model
- Interactive graph visualization using Three.js/expo-three
- Natural language querying of the knowledge base

### 4. User Interface
- Main graph visualization screen (zoomable/pannable)
- Search interface with natural language input
- Content viewer for examining nodes and their connections
- Basic filters for time periods, locations, entity types

## Technical Stack

### Frontend
- React Native with Expo
- expo-sqlite for local database
- expo-three for 3D graph visualization
- Local embedding model (TBD - investigating options)

### Backend (Future)
- REST API for database sync
- WebSocket server for real-time updates

## Implementation Todo List

### Phase 1: Basic Infrastructure (See Vertical Slice)
1. [x] Set up basic Expo project with TypeScript
2. [ ] Implement SQLite database schema and basic operations
3. [x] Create basic UI layout with navigation
4. [x] Implement basic graph visualization with Three.js
   - [x] Basic node rendering
   - [x] Edge rendering
   - [x] Basic rotation
   - [x] Node selection

### Phase 2: Knowledge Graph Core
1. [ ] Implement node creation/storage
   - [ ] Basic content storage
   - [ ] Metadata handling
   - [ ] SQLite operations wrapper
2. [ ] Research and implement local embedding model
   - [ ] Evaluate options (TensorFlow.js, ONNX, etc.)
   - [ ] Create embedding generation service
   - [ ] Implement embedding cache
3. [ ] Implement entity extraction
   - [ ] Integration with chosen LLM
   - [ ] Entity storage logic
   - [ ] Edge creation between content and entities

### Phase 3: Search & Query
1. [ ] Implement semantic search
   - [ ] Vector similarity search in SQLite
   - [ ] Query result ranking
2. [ ] Create natural language query interface
   - [ ] Query parsing
   - [ ] Result visualization
3. [ ] Implement basic filters
   - [ ] Time-based filtering
   - [ ] Location-based filtering
   - [ ] Entity type filtering

### Phase 4: UI/UX
1. [ ] Enhance graph visualization
   - [ ] Node clustering for performance
   - [ ] Edge bundling
   - [ ] Interactive node details
2. [ ] Implement search results view
   - [ ] Result cards
   - [ ] Preview of related content
3. [ ] Add basic animations and transitions

### Phase 5: Data Sync (Future)
1. [ ] Design REST API for database sync
2. [ ] Implement basic sync mechanism
3. [ ] Add WebSocket support for real-time updates

## Performance Considerations
- Local database size management
- Efficient graph rendering for large datasets
- Embedding computation optimization
- Caching strategy for frequently accessed data

## Future Enhancements
- User authentication
- Content submission
- Points/rewards system
- Social features
- Content validation
- Versioning system
- Feed/timeline view
- Manual entity editing
- Conflict resolution

## Initial Focus
The first version will focus on:
1. Basic graph visualization (see Vertical Slice)
2. Local database implementation
3. Simple semantic search
4. Content viewing

This will provide a foundation for future features while delivering immediate value to users.