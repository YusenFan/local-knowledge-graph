/**
 * Graph database client using Neo4j driver (Memgraph-compatible)
 * Falls back to mock client if database is not available
 */

import neo4j, { Driver, Session, Integer } from 'neo4j-driver';
import { FileNode, GraphViewData, GraphViewNode, GraphViewEdge } from '../../shared/types.js';

// Check if we should use mock database
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || process.env.GRAPH_DB_URI === 'mock://';

// Graph database connection
let driver: Driver | null = null;

/**
 * Initialize graph database connection
 */
export async function initGraphDB(): Promise<void> {
  if (USE_MOCK_DB) {
    console.log('📦 Using mock graph database (in-memory mode)');
    return;
  }

  if (driver) {
    return;
  }

  const uri = process.env.GRAPH_DB_URI || 'bolt://localhost:7687';
  const username = process.env.GRAPH_DB_USERNAME || '';
  const password = process.env.GRAPH_DB_PASSWORD || '';

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

    // Test connection
    const session = driver.session();
    try {
      await session.run('RETURN 1 as test');
      console.log('✓ Connected to Neo4j graph database');
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Failed to connect to graph database:', error);
    console.log('💡 Falling back to mock database...');
    process.env.USE_MOCK_DB = 'true';
  }
}

/**
 * Get the graph database driver
 */
export function getDriver(): Driver | null {
  return driver;
}

/**
 * Close graph database connection
 */
export async function closeGraphDB(): Promise<void> {
  if (USE_MOCK_DB) {
    console.log('✓ Mock graph database closed');
    return;
  }

  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * In-memory mock storage (used when Neo4j is not available)
 */
class MockGraphDatabase {
  private nodes: Map<string, any> = new Map();
  private edges: Map<string, any> = new Map();

  async addNode(node: any) {
    this.nodes.set(node.id, node);
  }

  async addEdge(edge: any) {
    const edgeId = `${edge.from}-${edge.to}`;
    this.edges.set(edgeId, edge);
  }

  async getAllNodes() {
    return Array.from(this.nodes.values());
  }

  async getAllEdges() {
    return Array.from(this.edges.values());
  }

  async getNode(id: string) {
    return this.nodes.get(id);
  }

  async clear() {
    this.nodes.clear();
    this.edges.clear();
  }

  async getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
    };
  }
}

const mockDB = new MockGraphDatabase();

/**
 * Create nodes from file system scan results
 */
export async function createNodes(nodes: FileNode[]): Promise<void> {
  if (USE_MOCK_DB) {
    console.log(`Creating ${nodes.length} nodes in mock database...`);

    for (const node of nodes) {
      await mockDB.addNode({
        id: node.id,
        path: node.path,
        name: node.name,
        type: node.type,
        extension: node.extension,
        size: node.size,
        depth: node.depth,
        createdAt: node.createdAt.toISOString(),
        modifiedAt: node.modifiedAt.toISOString(),
      });
    }

    console.log(`✓ Created ${nodes.length} nodes`);
    return;
  }

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

      await session.run(query, { nodes: batch.map((n) => ({
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
  if (USE_MOCK_DB) {
    console.log('Creating edges in mock database...');

    let edgeCount = 0;
    for (const node of nodes) {
      if (node.parentId) {
        await mockDB.addEdge({
          id: `edge-${node.parentId}-${node.id}`,
          from: node.parentId,
          to: node.id,
          type: 'CONTAINS',
          depth: node.depth,
        });
        edgeCount++;
      }
    }

    console.log(`✓ Created ${edgeCount} edges`);
    return;
  }

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
  if (USE_MOCK_DB) {
    const allNodes = await mockDB.getAllNodes();
    const allEdges = await mockDB.getAllEdges();

    let nodes = allNodes.map((node: any): GraphViewNode => ({
      id: node.id,
      label: node.name,
      type: node.type,
      properties: node,
      hasSummary: false,
    }));

    let edges = allEdges.map((edge: any): GraphViewEdge => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: edge.type,
      label: 'contains',
    }));

    if (limit) {
      nodes = nodes.slice(0, limit);
      edges = edges.slice(0, limit * 2);
    }

    return { nodes, edges };
  }

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
    const nodes: GraphViewNode[] = nodesResult.records.map((record: any) => ({
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
    const edges: GraphViewEdge[] = edgesResult.records.map((record: any) => ({
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
  if (USE_MOCK_DB) {
    const node = await mockDB.getNode(nodeId);

    if (!node) {
      return null;
    }

    // Find related nodes
    const relatedNodes: any[] = [];
    const allEdges = await mockDB.getAllEdges();

    for (const edge of allEdges) {
      if (edge.from === nodeId) {
        const child = await mockDB.getNode(edge.to);
        if (child) {
          relatedNodes.push({
            type: 'CONTAINS',
            relatedId: child.id,
            relatedName: child.name,
          });
        }
      } else if (edge.to === nodeId) {
        const parent = await mockDB.getNode(edge.from);
        if (parent) {
          relatedNodes.push({
            type: 'CONTAINED_BY',
            relatedId: parent.id,
            relatedName: parent.name,
          });
        }
      }
    }

    return {
      ...node,
      relationships: relatedNodes,
    };
  }

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
