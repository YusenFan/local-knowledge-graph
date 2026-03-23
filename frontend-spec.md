# Frontend Development Specification for Local Knowledge Graph

## Project Overview
A graph-first local knowledge system with LLM-powered structural understanding.
Backend is already running at http://localhost:3000

## API Endpoints Available
- POST /api/scan - Scan directory and build graph
- GET /api/graph - Get graph visualization data
- GET /api/graph/:id - Get node details
- GET /api/graph/:id/summary - Get markdown summary
- POST /api/query - Query the knowledge graph
- GET /api/query/suggestions - Get query suggestions
- POST /api/content - Load file content (on-demand)
- GET /health - Health check

## Frontend Requirements

### Technology Stack
- React 18+ with TypeScript
- Vite for build tooling
- Cytoscape.js or React Flow for graph visualization
- Tailwind CSS for styling
- Axios for API calls

### Core Features to Implement

1. **Dashboard Page** (`/`)
   - Show graph statistics (total nodes, files, directories)
   - Quick actions: Scan new directory, Run query
   - Display system status (Neo4j connection, API status)

2. **Graph Visualization Page** (`/graph`)
   - Interactive force-directed graph visualization
   - Node details panel (click to expand)
   - Search/filter nodes
   - Zoom and pan controls
   - Node color coding by type (file/directory)

3. **Query Interface** (`/query`)
   - Natural language query input
   - Display query results
   - Show related nodes/paths
   - Query suggestions dropdown
   - Query history

4. **Scan Interface** (`/scan`)
   - Directory selection input
   - Scan options (max depth, include hidden)
   - Progress indicator
   - Scan results display
   - Markdown node preview

5. **Node Details Panel** (side panel or modal)
   - Node metadata (path, type, size, dates)
   - Markdown summary display
   - Related nodes list
   - Load file content button (on-demand)

### UI/UX Requirements
- Clean, modern interface
- Dark mode support
- Responsive design (mobile-friendly)
- Loading states for async operations
- Error handling and user feedback
- Accessible (WCAG AA compliance)

### Component Structure
```
src/
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── components/
│   ├── GraphVisualization.tsx   # Cytoscape.js wrapper
│   ├── QueryInterface.tsx       # Query input and results
│   ├── ScanInterface.tsx        # Directory scanner UI
│   ├── NodeDetails.tsx         # Node info panel
│   ├── Dashboard.tsx           # Home page
│   ├── Layout.tsx              # App shell
│   └── common/               # Reusable components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Loading.tsx
├── hooks/
│   ├── useGraph.ts             # Graph data fetching
│   ├── useQuery.ts            # Query operations
│   └── useScan.ts             # Scan operations
├── services/
│   └── api.ts                 # API client
├── types/
│   └── index.ts                # TypeScript types
└── styles/
    └── globals.css             # Global styles
```

### API Client
```typescript
// services/api.ts
const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  // Scan
  scanDirectory: (path: string, options: ScanOptions) => 
    axios.post('/scan', { path, options }),
  
  // Graph
  getGraph: (limit?: number) => 
    axios.get('/graph', { params: { limit } }),
  
  getNode: (id: string) => 
    axios.get(`/graph/${id}`),
  
  getNodeSummary: (id: string) => 
    axios.get(`/graph/${id}/summary}`),
  
  // Query
  queryGraph: (query: string) => 
    axios.post('/query', { query }),
  
  getQuerySuggestions: () => 
    axios.get('/query/suggestions'),
  
  // Content
  loadContent: (nodeId: string) => 
    axios.post('/content', { nodeId }),
  
  // Health
  getHealth: () => 
    axios.get('/health', { baseURL: '' }),
};
```

### Testing Requirements
- Unit tests for components (Vitest)
- Integration tests for API calls
- E2E tests for critical user flows (Playwright)
- Test graph rendering with mock data
- Test error handling

### Deployment
- Build for production: `npm run build`
- Output: `dist/` directory
- Serve with any static server or Netlify/Vercel
- Configure API URL for production

### Success Criteria
✅ Frontend can connect to backend API
✅ Graph visualization displays correctly
✅ Users can scan directories
✅ Users can query the knowledge graph
✅ Node details display properly
✅ All pages are responsive
✅ Loading states work correctly
✅ Error handling is user-friendly
✅ Tests pass
✅ Can be built for production

