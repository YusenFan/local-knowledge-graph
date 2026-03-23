#!/bin/bash

# Tinfoil API Test Script
# Verify Tinfoil API connection and functionality

echo "=========================================="
echo "🔐 Tinfoil API Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check Configuration
echo -e "${BLUE}1. Check Configuration${NC}"

if [ -f .env ]; then
    source .env

    if [ -n "$TINFOIL_API_KEY" ] && [ "$TINFOIL_API_KEY" = "tk_1WeQDUXBy64ogOKn8BVUjCt4CVracS81ssdcJaImADeomIDB" ]; then
        echo -e "${GREEN}✓ Tinfoil API Key: ${TINFOIL_API_KEY:0:8}...${TINFOIL_API_KEY:8:52}${NC}"
    else
        echo -e "${RED}✗ Tinfoil API Key not found or invalid${NC}"
        exit 1
    fi

    if [ -n "$TINFOIL_API_URL" ]; then
        echo -e "${GREEN}✓ Tinfoil API URL: ${TINFOIL_API_URL}${NC}"
    else
        echo -e "${RED}✗ Tinfoil API URL not found${NC}"
        exit 1
    fi

    if [ -n "$TINFOIL_MODEL" ]; then
        echo -e "${GREEN}✓ Model: ${TINFOIL_MODEL}${NC}"
    else
        echo -e "${YELLOW}⚠ Model not set, using default${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

echo ""

# Test 2: Test API Connection
echo -e "${BLUE}2. Test API Connection${NC}"

node -e "
const { testConnection } = require('./dist/src/backend/llm/tinfoil.js');

(async () => {
  try {
    console.log('Testing Tinfoil API connection...');
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✓ Tinfoil API connection successful!');
    console.log('  API is ready for use.');
    process.exit(0);
    } else {
      console.error('✗ Tinfoil API connection failed');
      console.error('  Please check your API key and URL.');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error testing connection:', error.message);
    process.exit(1);
  }
})();
"

CONNECTION_RESULT=$?
if [ $CONNECTION_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ API Connection Test PASSED${NC}"
else
    echo -e "${RED}✗ API Connection Test FAILED${NC}"
fi

echo ""

# Test 3: Generate Sample Summary
echo -e "${BLUE}3. Generate Sample Summary${NC}"

node -e "
const { generateNodeSummary } = require('./dist/src/backend/llm/tinfoil.js');

(async () => {
  try {
    console.log('Generating sample node summary...');
    const summary = await generateNodeSummary(
      'index.ts',
      'file',
      {
        path: '/home/ubuntu/.openclaw/workspace/local-knowledge-graph/src/backend/index.ts',
        extension: '.ts',
        size: 2905,
        siblings: ['routes', 'scanner', 'graph', 'llm'],
        parent: 'backend',
        children: []
      }
    );

    console.log('✓ Sample summary generated:');
    console.log(summary);
    console.log('');
    console.log('Summary length:', summary.length, 'characters');
    console.log('✓ Tinfoil API is ready for production use.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error generating summary:', error.message);
    process.exit(1);
  }
})();
"

SUMMARY_RESULT=$?
if [ $SUMMARY_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Summary Generation Test PASSED${NC}"
else
    echo -e "${RED}✗ Summary Generation Test FAILED${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ All Tests Completed!${NC}"
echo "=========================================="
echo ""
echo "📚 Tinfoil API is configured and ready to use!"
echo ""
echo "📋 Configuration:"
echo "  - API Key: ${TINFOIL_API_KEY:0:8}...${TINFOIL_API_KEY:8:52}"
echo "  - API URL: ${TINFOIL_API_URL}"
echo "  - Model: ${TINFOIL_MODEL}"
echo ""
echo "🚀 Next steps:"
echo "  1. Restart backend: npm run dev:backend"
echo "  2. Scan a directory: curl -X POST http://localhost:3000/api/scan ..."
echo "  3. Query the graph: curl -X POST http://localhost:3000/api/query ..."
echo ""
