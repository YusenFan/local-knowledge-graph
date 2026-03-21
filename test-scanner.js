/**
 * Test script for scanner module (without graph database)
 */

import { scanDirectory } from './dist/src/backend/scanner/index.js';

async function testScanner() {
  try {
    console.log('Testing directory scanner...\n');

    // Test scanning the current project directory
    const result = await scanDirectory('/home/ubuntu/.openclaw/workspace/local-knowledge-graph', {
      maxDepth: 2,
      includeHidden: false,
    });

    console.log('✓ Scan completed!\n');
    console.log('Statistics:');
    console.log(`  Total Files: ${result.stats.totalFiles}`);
    console.log(`  Total Directories: ${result.stats.totalDirectories}`);
    console.log(`  Total Size: ${(result.stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`  Scan Time: ${result.stats.scanTime}ms`);
    console.log(`\nTotal Nodes: ${result.nodes.length}\n`);

    // Show some sample nodes
    console.log('Sample nodes:');
    result.nodes.slice(0, 10).forEach((node) => {
      console.log(`  [${node.type}] ${node.name}`);
      if (node.depth > 0) {
        console.log(`    → Path: ${node.path}`);
      }
    });

    console.log('\n✓ Test successful!');
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

testScanner();
