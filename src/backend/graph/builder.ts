/**
 * Graph builder - constructs graph from file system scan results
 */

import { FileNode } from '../../shared/types.js';
import { initGraphDB, createNodes, createEdges, getDriver } from './client.js';

/**
 * Build the graph from file system scan results
 */
export async function buildGraphFromScan(nodes: FileNode[]): Promise<void> {
  console.log('Building graph from scan results...');

  // Initialize graph database connection
  await initGraphDB();

  // Clear existing graph (optional - comment out if you want to keep history)
  // await clearGraph();

  // Create nodes
  console.log(`Creating ${nodes.length} nodes...`);
  await createNodes(nodes);

  // Create edges
  console.log('Creating edges...');
  await createEdges(nodes);

  console.log('✓ Graph built successfully');
}

/**
 * Clear all data from the graph
 */
export async function clearGraph(): Promise<void> {
  await initGraphDB();

  const driver = getDriver();

  if (!driver) {
    throw new Error('Graph database not initialized');
  }

  const session = driver.session();

  try {
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✓ Graph cleared');
  } finally {
    await session.close();
  }
}

/**
 * Update graph with new or modified nodes
 */
export async function updateGraph(nodes: FileNode[]): Promise<void> {
  // For now, just rebuild the graph
  // TODO: Implement incremental updates
  await buildGraphFromScan(nodes);
}
