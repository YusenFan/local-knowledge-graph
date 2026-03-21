#!/bin/bash

# API Test Script for Local Knowledge Graph
# This script tests all major endpoints

echo "=========================================="
echo "🧠 Local Knowledge Graph API Test"
echo "=========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s $BASE_URL/health | python3 -m json.tool
echo ""

# Test 2: Scan a Directory
echo -e "${BLUE}2. Scan Directory${NC}"
echo "Scanning /home/ubuntu/.openclaw/workspace/local-knowledge-graph/src ..."
SCAN_RESULT=$(curl -s -X POST $BASE_URL/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/home/ubuntu/.openclaw/workspace/local-knowledge-graph/src",
    "options": {
      "maxDepth": 2,
      "includeHidden": false
    }
  }')

echo $SCAN_RESULT | python3 -m json.tool | head -20
echo ""

# Test 3: Get Graph Visualization
echo -e "${BLUE}3. Get Graph Visualization (first 10 nodes)${NC}"
curl -s "$BASE_URL/api/graph?limit=10" | python3 -m json.tool | head -40
echo ""

# Test 4: Query the Graph
echo -e "${BLUE}4. Query: What files are in my project?${NC}"
curl -s -X POST $BASE_URL/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What files are in my project?"}' | python3 -m json.tool
echo ""

# Test 5: Query with Keywords
echo -e "${BLUE}5. Query: Show me TypeScript files${NC}"
curl -s -X POST $BASE_URL/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me TypeScript files"}' | python3 -m json.tool
echo ""

# Test 6: Query Suggestions
echo -e "${BLUE}6. Get Query Suggestions${NC}"
curl -s $BASE_URL/api/query/suggestions | python3 -m json.tool
echo ""

# Test 7: Scan Status
echo -e "${BLUE}7. Get Scan Status${NC}"
curl -s $BASE_URL/api/scan/status | python3 -m json.tool
echo ""

echo -e "${GREEN}✓ All tests completed!${NC}"
echo ""
echo "API Documentation: $BASE_URL/docs"
echo "Swagger UI: $BASE_URL/docs"
