/**
 * Graph database client using Memgraph (Neo4j-compatible)
 */

import { Client as Neo4jClient } from 'memgraph-driver';
import { FileNode, GraphNode, GraphEdge, GraphViewData, GraphViewNode, GraphViewEdge } from '../../shared/types.js';

// Graph database connection
let driver: Neo4jClient | null = null;

/**
 * Initialize graph database connection
 */
export async function initGraphDB(): Promise<void> {
  if (driver) {
    return;
  }

  const uri = process.env.GRAPH_DB_URI || 'bolt://localhost:7687';
  const username = process.env.GRAPH_DB_USERNAME || '';
  const password = process.env.GRAPH_DB_PASSWORD || '';

  try {
    driver = new Neo4jClient(uri, {
      username,
      password,
    });

    // Test connection
    const session = driver.session();
    try {
      await session.run('RETURN 1 as test');
      console.log('✓ Connected to Memgraph database');
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Failed to connect to graph database:', error);
    throw error;
  }
}

/**
 * Close graph database connection
 */
export async function closeGraphDB(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Create nodes from file system scan results
 */
export async function createNodes(nodes: FileNode[]): Promise<void> {
  if (!driver) {
    throw new Error('Graph database not initialized');
  }

  const session = driver.session();

  try {
    // Create nodes in batches
    const batchSize = 100;
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);

      const query = `
        UNWIND $nodes AS node
        MERGE (n:FileNode {id: node.id})
        SET n += {
          path: node.path,
          name: node.name,
          type: node.type,
          extension: node.extension,
          size: node.size,
          depth: node.depth,
          createdAt: datetime(node.createdAt),
          modifiedAt: datetime(node.modifiedAt)
        }
        SET n:Directory WHERE node.type = 'directory'
        SET n:File WHERE node.type = 'file'
      `;

      await session.run(query, { nodes: batch.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        modifiedAt: n.modifiedAt.toISOString(),
      })) });
    }
  } finally {
    await session.close();
  }
}

/**
 * Create edges (relationships) between nodes
 */
export async function createEdges(nodes: FileNode[]): Promise<void> {
  if (!driver) {
    throw new Error('Graph database not initialized');
  }

  const session = driver.session();

  try {
    // Create CONTAINS relationships
    const query = `
      UNWIND $edges AS edge
      MATCH (parent:FileNode {id: edge.parentId})
      MATCH (child:FileNode {id: edge.childId})
      MERGE (parent)-[r:CONTAINS]->(child)
      SET r.depth = edge.depth
    `;

    const edges = nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        parentId: node.parentId!,
        childId: node.id,
        depth: node.depth,
      }));

    await session.run(query, { edges });
  } finally {
    await session.close();
  }
}

/**
 * Get graph visualization data
 */
export async function getGraphVisualization(limit?: number): Promise<GraphViewData> {
  if (!driver) {
    throw new Error('Graph database not initialized');
  }

  const session = driver.session();

  try {
    // Get nodes
    let nodesQuery = `
      MATCH (n:FileNode)
      RETURN n.id as id, n.name as label, n.type as type, properties(n) as properties
    `;

    if (limit) {
      nodesQuery += ` LIMIT ${limit}`;
    }

    const nodesResult = await session.run(nodesQuery);
    const nodes: GraphViewNode[] = nodesResult.records.map((record) => ({
      id: record.get('id'),
      label: record.get('label'),
      type: record.get('type'),
      properties: record.get('properties'),
      hasSummary: false, // TODO: Check if markdown exists
    }));

    // Get edges
    let edgesQuery = `
      MATCH (a)-[r:CONTAINS]->(b)
      RETURN id(r) as id, a.id as source, b.id as target, type(r) as type, 'contains' as label
    `;

    if (limit) {
      edgesQuery += ` LIMIT ${limit * 2}`;
    }

    const edgesResult = await session.run(edgesQuery);
    const edges: GraphViewEdge[] = edgesResult.records.map((record) => ({
      id: record.get('id').toString(),
      source: record.get('source'),
      target: record.get('target'),
      type: record.get('type'),
      label: record.get('label'),
    }));

    return { nodes, edges };
  } finally {
    await session.close();
  }
}

/**
 * Get node details
 */
export async function getNodeDetails(nodeId: string): Promise<any | null> {
  if (!driver) {
    throw new Error('Graph database not initialized');
  }

  const session = driver.session();

  try {
    const query = `
      MATCH (n:FileNode {id: $nodeId})
      OPTIONAL MATCH (n)-[r]-(related)
      RETURN n, collect(DISTINCT {type: type(r), relatedId: related.id}) as relationships
    `;

    const result = await session.run(query, { nodeId });

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    return {
      ...record.get('n').properties,
      relationships: record.get('relationships'),
    };
  } finally {
    await session.close();
  }
}
