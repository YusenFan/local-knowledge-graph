# Setup Guide

## Prerequisites

- Node.js 18+ (current: v22.22.1)
- npm 10+ (current: v10.9.4)
- Git
- Neo4j Community Edition or Memgraph (for graph database)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YusenFan/local-knowledge-graph.git
cd local-knowledge-graph
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `fastify` - Web framework
- `neo4j-driver` - Graph database driver
- `@fastify/cors`, `@fastify/swagger` - API enhancements
- `dotenv` - Environment configuration

### 3. Set Up Graph Database

#### Option A: Neo4j Community Edition (Recommended)

**Download and Install:**

```bash
# Linux
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt update
sudo apt install neo4j

# Or download from: https://neo4j.com/download/
```

**Start Neo4j:**

```bash
sudo systemctl start neo4j
# or
sudo service neo4j start
```

**Configure:**

- Default URL: `bolt://localhost:7687`
- Default UI: `http://localhost:7474`
- First login: Set a password for user `neo4j`

#### Option B: Memgraph (Docker)

```bash
docker run -d \
  -p 7687:7687 \
  -p 7444:7444 \
  memgraph/memgraph-platform
```

#### Option C: Neo4j (Docker)

```bash
docker run -d \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:latest
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Graph Database
GRAPH_DB_URI=bolt://localhost:7687
GRAPH_DB_USERNAME=neo4j
GRAPH_DB_PASSWORD=your_password

# LLM (Tinfoil / Confidential AI) - Optional for MVP
LLM_API_URL=
LLM_API_KEY=
LLM_MODEL=

# Server
PORT=3000
HOST=localhost

# Paths
WORKSPACE_ROOT=/home/ubuntu
MARKDOWN_NODES_DIR=./markdown-nodes

# Security
ENABLE_ATTESTATION=true
TEE_ENABLED=true
```

### 5. Build and Run

```bash
# Development mode (auto-reload)
npm run dev:backend

# Or compile and run
npm run build
npm run backend
```

The server should start at `http://localhost:3000`

## Testing Without Graph Database

You can test the scanner module without running a graph database:

```bash
node test-scanner.js
```

This will scan a directory and print statistics.

## API Documentation

Once the server is running:

- **Swagger UI**: http://localhost:3000/docs
- **API Root**: http://localhost:3000/api

### Example API Calls

#### 1. Scan a Directory

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/home/ubuntu/projects",
    "options": {
      "maxDepth": 3,
      "includeHidden": false
    }
  }'
```

#### 2. Get Graph Visualization

```bash
curl http://localhost:3000/api/graph
```

#### 3. Query the Graph

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What modules are in my project?"
  }'
```

#### 4. Get Node Details

```bash
curl http://localhost:3000/api/graph/{nodeId}
```

#### 5. Load File Content

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "{nodeId}"
  }'
```

## Troubleshooting

### Issue: "Failed to connect to graph database"

**Solution:**
- Verify graph database is running: `sudo systemctl status neo4j` or `docker ps`
- Check URI, username, and password in `.env`
- Try connecting from Neo4j Browser: `http://localhost:7474`

### Issue: TypeScript compilation errors

**Solution:**
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Issue: Port already in use

**Solution:**
Change `PORT` in `.env` or stop the conflicting service.

### Issue: Permission denied on directory scan

**Solution:**
- Ensure you have read permissions on the target directory
- Check file system permissions: `ls -la /path/to/directory`

## Development Workflow

### Code Structure

```
src/
├── backend/
│   ├── scanner/      # File system scanning
│   ├── graph/        # Graph database operations
│   ├── llm/          # LLM integration
│   └── routes/       # API endpoints
└── shared/           # Shared types
```

### Adding New Features

1. Create new module in `src/backend/`
2. Add types in `src/shared/types.ts`
3. Create route in `src/backend/routes/`
4. Update API documentation (Swagger)

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Performance Tips

1. **Batch Operations**: Graph operations are already batched (100 nodes at a time)
2. **Limit Scan Depth**: Set `maxDepth` in scan options to limit recursion
3. **Filter Extensions**: Use `fileExtensions` option to scan only specific file types
4. **Graph Indexing**: Neo4j automatically indexes node IDs; add custom indexes if needed

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Path Validation**: Scanner validates paths before scanning
3. **Explicit Authorization**: Users must select directories explicitly
4. **No Default Content**: File content only loaded on user request

## Next Steps

- [ ] Install Neo4j or Memgraph
- [ ] Configure `.env` file
- [ ] Start the backend server
- [ ] Test the API endpoints
- [ ] Explore the Swagger documentation
- [ ] Build the frontend UI

---

**Need Help?**

- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub
