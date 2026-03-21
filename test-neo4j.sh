#!/bin/bash

# Neo4j Integration Test
# Verify Neo4j is fully functional with the application

echo "=========================================="
echo "🗄️  Neo4j Integration Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check Neo4j service
echo -e "${BLUE}1. Neo4j Service Status${NC}"
if sudo systemctl is-active --quiet neo4j; then
    echo -e "${GREEN}✓ Neo4j is running${NC}"
else
    echo -e "${RED}✗ Neo4j is not running${NC}"
    echo "Starting Neo4j..."
    sudo systemctl start neo4j
    sleep 3
fi
echo ""

# Test 2: Check Neo4j ports
echo -e "${BLUE}2. Neo4j Ports${NC}"
BOLT_PORT=$(ss -tlnp 2>/dev/null | grep 7687 | wc -l)
HTTP_PORT=$(ss -tlnp 2>/dev/null | grep 7474 | wc -l)

if [ "$BOLT_PORT" -gt 0 ]; then
    echo -e "${GREEN}✓ Bolt port 7687 is listening${NC}"
else
    echo -e "${RED}✗ Bolt port 7687 is not listening${NC}"
fi

if [ "$HTTP_PORT" -gt 0 ]; then
    echo -e "${GREEN}✓ HTTP port 7474 is listening${NC}"
else
    echo -e "${RED}✗ HTTP port 7474 is not listening${NC}"
fi
echo ""

# Test 3: Check application configuration
echo -e "${BLUE}3. Application Configuration${NC}"
USE_MOCK=$(grep "^USE_MOCK_DB=" /home/ubuntu/.openclaw/workspace/local-knowledge-graph/.env | cut -d'=' -f2)
GRAPH_URI=$(grep "^GRAPH_DB_URI=" /home/ubuntu/.openclaw/workspace/local-knowledge-graph/.env | cut -d'=' -f2)

if [ "$USE_MOCK" = "false" ]; then
    echo -e "${GREEN}✓ Using Neo4j (not mock)${NC}"
    echo "  URI: $GRAPH_URI"
else
    echo -e "${RED}✗ Still using mock database${NC}"
    echo "  Please update .env to set USE_MOCK_DB=false"
fi
echo ""

# Test 4: Scan directory with Neo4j
echo -e "${BLUE}4. Scan Directory (Neo4j)${NC}"
SCAN_RESULT=$(curl -s -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/home/ubuntu/.openclaw/workspace/local-knowledge-graph/src",
    "options": { "maxDepth": 2 }
  }')

if echo "$SCAN_RESULT" | grep -q '"success":true'; then
    NODE_COUNT=$(echo "$SCAN_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['result']['stats']['totalNodes'])" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ Scan successful - $NODE_COUNT nodes${NC}"
else
    echo -e "${RED}✗ Scan failed${NC}"
    echo "$SCAN_RESULT" | python3 -m json.tool 2>/dev/null || echo "$SCAN_RESULT"
fi
echo ""

# Test 5: Query graph
echo -e "${BLUE}5. Query Graph${NC}"
QUERY_RESULT=$(curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What files are in my project?"}')

if echo "$QUERY_RESULT" | grep -q '"answer"'; then
    echo -e "${GREEN}✓ Query successful${NC}"
    echo "$QUERY_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Answer: {data['answer'][:100]}...\")" 2>/dev/null || echo "$QUERY_RESULT"
else
    echo -e "${RED}✗ Query failed${NC}"
fi
echo ""

# Test 6: Get graph visualization
echo -e "${BLUE}6. Get Graph Visualization${NC}"
GRAPH_RESULT=$(curl -s http://localhost:3000/api/graph?limit=5)

if echo "$GRAPH_RESULT" | grep -q '"nodes"'; then
    NODE_COUNT=$(echo "$GRAPH_RESULT" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['nodes']))" 2>/dev/null || echo "0")
    EDGE_COUNT=$(echo "$GRAPH_RESULT" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['edges']))" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ Graph data retrieved${NC}"
    echo "  Nodes: $NODE_COUNT"
    echo "  Edges: $EDGE_COUNT"
else
    echo -e "${RED}✗ Failed to get graph data${NC}"
fi
echo ""

# Test 7: Check backend logs for Neo4j connection
echo -e "${BLUE}7. Neo4j Connection Log${NC}"
if grep -q "Connected to Neo4j graph database" /home/ubuntu/.openclaw/workspace/local-knowledge-graph/backend.log 2>/dev/null; then
    echo -e "${GREEN}✓ Successfully connected to Neo4j${NC}"
else
    echo -e "${RED}✗ Neo4j connection not found in logs${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✓ Neo4j Integration Test Complete!${NC}"
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "  - SETUP.md: Installation guide"
echo "  - NEO4J_SETUP.md: Neo4j configuration"
echo "  - API Docs: http://localhost:3000/docs"
echo "  - Neo4j Browser: http://localhost:7474"
echo ""
