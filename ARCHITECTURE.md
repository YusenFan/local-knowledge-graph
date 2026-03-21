# Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Graph View   │  │   Chat UI    │  │  Node Details │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Fastify)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Scan Routes  │  │ Graph Routes │  │ Query Routes │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Scanner     │  │   Graph DB    │  │  LLM Module   │
│               │  │  (Memgraph)  │  │  (Tinfoil)    │
│ - Dir Scan    │  │ - Nodes       │  │ - Summarize   │
│ - Metadata    │  │ - Edges       │  │ - Tags        │
│ - Content     │  │ - Queries     │  │ - Inference   │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │
        └───────────────────┼───────────────────┐
                            ↓                   ↓
                   ┌───────────────┐   ┌───────────────┐
                   │  Markdown     │   │ File System   │
                   │  Nodes       │   │               │
                   └───────────────┘   └───────────────┘
```

## Core Components

### 1. Scanner Module

**Purpose**: Scans local file system and extracts structural metadata

**Responsibilities**:
- Recursive directory traversal
- File metadata extraction (name, type, size, timestamps)
- Path relationship tracking
- Permission validation

**Key Functions**:
- `scanDirectory()` - Main scanning function
- `validatePath()` - Security validation
- `loadNodeContent()` - On-demand content loading

**Design Decisions**:
- Does NOT read file content by default (privacy + performance)
- Uses depth-first traversal
- Supports filtering by extension and depth

### 2. Graph Database Module

**Purpose**: Stores and manages the knowledge graph

**Technology**: Memgraph (Neo4j-compatible)

**Data Model**:
```
Node: FileNode
  - id: string (unique)
  - path: string
  - name: string
  - type: "file" | "directory"
  - extension: string?
  - size: number?
  - createdAt: datetime
  - modifiedAt: datetime
  - depth: number

Edge: CONTAINS
  - from: parent node
  - to: child node
  - depth: number
```

**Key Functions**:
- `createNodes()` - Batch node creation
- `createEdges()` - Relationship creation
- `getGraphVisualization()` - Export for frontend
- `getNodeDetails()` - Get single node with relationships

**Design Decisions**:
- Uses Cypher query language
- Batch operations for performance
- Lazy relationship loading

### 3. LLM Module

**Purpose**: Generates semantic understanding of file structure

**Technology**: Tinfoil (Confidential AI Runtime)

**Responsibilities**:
- Generate node summaries
- Infer file purpose
- Extract tags and relationships
- Query understanding (future)

**Key Functions**:
- `generateMarkdownNodes()` - Batch summary generation
- `generateMarkdownNode()` - Single node processing
- `inferPurpose()` - Purpose inference from metadata

**Design Decisions**:
- Markdown as human-readable intermediate representation
- Heuristic-based inference (MVP)
- TEE integration for privacy

### 4. Query Engine

**Purpose**: Answers natural language queries about the graph

**Current Implementation**:
- Keyword-based matching
- Simple pattern recognition
- Type-based filtering

**Future Implementation**:
- LLM-powered query understanding
- Complex relationship traversal
- Multi-hop reasoning

**Key Functions**:
- `queryGraph()` - Main query function
- `findNodesByType()` - Type-based filtering
- `findNodesByKeyword()` - Keyword search

### 5. API Layer

**Technology**: Fastify (HTTP/REST API)

**Routes**:
```
POST   /api/scan              - Scan directory
GET    /api/scan/status       - Get scan status

GET    /api/graph             - Get graph visualization
GET    /api/graph/:id         - Get node details
GET    /api/graph/:id/summary - Get markdown summary

POST   /api/query             - Query the graph
GET    /api/query/suggestions - Get query suggestions

POST   /api/content           - Load file content
GET    /api/content/:id/metadata - Get file metadata
```

## Data Flow

### 1. Directory Scan Flow

```
User selects directory
  ↓
API: POST /api/scan
  ↓
Scanner: scanDirectory()
  ↓
Graph: createNodes() + createEdges()
  ↓
LLM: generateMarkdownNodes()
  ↓
Markdown files created
  ↓
Response: Scan result + stats
```

### 2. Query Flow

```
User asks question
  ↓
API: POST /api/query
  ↓
Query Engine: Analyze query
  ↓
Graph: Execute query (nodes + edges)
  ↓
Markdown: Read node summaries
  ↓
Response: Answer + sources
```

### 3. Content Load Flow

```
User clicks node + confirms
  ↓
API: POST /api/content
  ↓
Scanner: loadNodeContent()
  ↓
File System: Read file
  ↓
Response: File content
```

## Security & Privacy

### 1. Local-Only Processing
- No data leaves the local machine
- No cloud dependencies (except LLM API)

### 2. Confidential Computing
- LLM runs in TEE (Trusted Execution Environment)
- Attestation verifies code authenticity
- Data encrypted in memory

### 3. Explicit Authorization
- User must select directories
- On-demand content loading
- Clear permission boundaries

## Scalability Considerations

### 1. Performance Optimizations
- Batch operations (nodes, edges)
- Lazy relationship loading
- Indexed queries

### 2. Storage Management
- Markdown nodes can be purged and regenerated
- Graph database can be cleared and rebuilt
- Content never stored in graph

### 3. Future Scalability
- Distributed graph database (Neo4j Cluster)
- Streaming for large file systems
- Incremental graph updates

## Future Extensions

### Phase 2: Enhanced Structure Understanding
- Entity extraction (projects, modules)
- Semantic relationships
- Time-based analysis

### Phase 3: Content Integration
- Selective content reading
- Code semantic analysis
- Documentation summarization

### Phase 4: Extended Memory
- Conversation memory
- Cross-device sync
- User profile generation

### Phase 5: Advanced Features
- Real-time monitoring
- Multi-modal inputs
- Collaborative sharing

---

*Last updated: 2026-03-21*
