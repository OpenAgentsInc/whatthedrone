# Source Management in WhatTheDrone

This document explains how WhatTheDrone handles multiple source documents and builds a comprehensive knowledge graph from them.

## Overview

WhatTheDrone aggregates information from multiple news sources about drone-related events, creating a connected knowledge graph that shows relationships between entities (people, places, organizations) and concepts across different sources.

## Source File Structure

Sources are stored as markdown files in the `sources/` directory:

```
sources/
├── telegraph-mayorkas-drone-powers.md
├── reuters-drone-sightings.md
└── ...
```

Each source file should follow this format:

```markdown
# [Article Title]

Source: [Publication Name]
Author: [Author Name]
Date: [YYYY-MM-DD]
URL: [Source URL]

## Key Details
- Publication: [Publication Name]
- Author: [Author Name]
- Date: [YYYY-MM-DD HH:MM GMT]
- Type: [Article Type]
- Topics: [Main Topics]

## Full Content

[Article text...]
```

## Data Structure

### Node Types
- `source`: Source documents
- `person`: People mentioned in sources
- `organization`: Organizations and agencies
- `place`: Locations and facilities
- `event`: Specific events or incidents
- `claim`: Statements or assertions
- `topic`: General topics or themes
- `theory`: Proposed explanations or theories

### Edge Types
- `mentions`: Source references an entity
- `claims`: Entity makes a statement
- `located_in`: Geographic relationships
- `works_for`: Organizational relationships
- `related_to`: General relationships
- `supports`: Entity supports a claim/theory
- `opposes`: Entity opposes a claim/theory

### Metadata
Nodes and edges can include additional metadata:
```typescript
// Node metadata
{
  date?: string;
  url?: string;
  author?: string;
  role?: string;
  location?: string;
  description?: string;
}

// Edge metadata
{
  date?: string;
  description?: string;
}
```

## Processing Pipeline

1. **Source Loading**
   ```typescript
   async function loadSource(filename: string): Promise<Source>
   ```
   - Reads markdown file
   - Parses metadata and content
   - Returns structured source object

2. **Entity Extraction**
   ```typescript
   async function extractEntities(source: Source): Promise<EntityExtraction>
   ```
   - Identifies entities in the text
   - Extracts relationships between entities
   - Categories:
     - People
     - Organizations
     - Places
     - Topics
     - Theories
     - Claims

3. **Graph Integration**
   ```typescript
   function mergeSourceIntoGraph(
     source: Source, 
     extraction: EntityExtraction, 
     existingGraph: GraphData
   ): GraphData
   ```
   - Adds new source node
   - Creates/updates entity nodes
   - Establishes relationships (edges)
   - Updates node positions

## Visualization

### Node Layout
- Source nodes at center
- Entity nodes in concentric circles by type
- Automatic position generation based on node type and count
- Dynamic repositioning when new sources are added

### Visual Elements
- Different colors for node types
- Edge styles indicate relationship types
- Node size can indicate importance/connectivity
- Tooltips show metadata on hover

## Adding New Sources

1. Create markdown file in `sources/` following the template
2. Add filename to `sourceFiles` array in `data/sources.ts`:
   ```typescript
   const sourceFiles = [
     'telegraph-mayorkas-drone-powers.md',
     'your-new-source.md'
   ];
   ```
3. Run graph building process:
   ```typescript
   const graph = await buildCompleteGraph();
   ```

## Future Improvements

1. **Automated Entity Extraction**
   - Integration with LLM for entity recognition
   - Relationship inference
   - Claim extraction and categorization

2. **Enhanced Visualization**
   - Interactive node positioning
   - Relationship type filtering
   - Timeline view of events
   - Source credibility scoring

3. **Data Management**
   - Entity deduplication
   - Conflict resolution between sources
   - Version tracking of claims/theories
   - Source reliability metrics

4. **User Interface**
   - Source submission interface
   - Entity editing tools
   - Relationship validation
   - Custom views/filters

## Implementation Status

- [x] Basic graph visualization
- [x] Initial source parsing
- [x] Type definitions
- [ ] Entity extraction
- [ ] Source merging
- [ ] Automated layout
- [ ] Enhanced visualization
- [ ] User interface

## Contributing

When adding a new source:
1. Follow the markdown template
2. Include all available metadata
3. Tag entities consistently
4. Document any special handling needed
5. Test graph integration
6. Update visualization if needed