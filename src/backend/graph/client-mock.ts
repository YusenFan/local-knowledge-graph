/**
 * Mock graph client for testing without a database
 * This uses in-memory storage instead of Neo4j/Memgraph
 */

import { FileNode, GraphViewData, GraphViewNode, GraphViewEdge } from '../../shared/types.js';

// In-memory storage
class MockGraphDatabase {
  private nodes: Map<string, any> = new Map();
  private edges: Map<string, any> = new Map();

  constructor() {
    console.log('📦 Using mock graph database (in-memory)');
  }

  async clear() {
    this.nodes.clear();
    this.edges.clear();
  }

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

  async getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
    };
  }
}

const mockDB = new MockGraphDatabase();

/**
 * Initialize graph database connection
 */
export async function initGraphDB(): Promise<void> {
  console.log('✓ Mock graph database initialized');
}

/**
 * Get the driver (for compatibility with other modules)
 */
export function getDriver(): any {
  return null;
}

/**
 * Close graph database connection
 */
export async function closeGraphDB(): Promise<void> {
  console.log('✓ Mock graph database closed');
}

/**
 * Create nodes from file system scan results
 */
export async function createNodes(nodes: FileNode[]): Promise<void> {
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
}

/**
 * Create edges (relationships) between nodes
 */
export async function createEdges(nodes: FileNode[]): Promise<void> {
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
}

/**
 * Get graph visualization data
 */
export async function getGraphVisualization(limit?: number): Promise<GraphViewData> {
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

/**
 * Get node details
 */
export async function getNodeDetails(nodeId: string): Promise<any | null> {
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
