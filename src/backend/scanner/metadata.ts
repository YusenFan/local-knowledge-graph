/**
 * Metadata reader - gets file metadata without loading content
 */

import { getNodeDetails } from '../graph/client.js';

/**
 * Get node metadata from graph database
 */
export async function getNodeMetadata(nodeId: string): Promise<any | null> {
  try {
    const nodeDetails = await getNodeDetails(nodeId);

    if (!nodeDetails) {
      return null;
    }

    // Return only metadata, not content
    return {
      id: nodeDetails.id,
      path: nodeDetails.path,
      name: nodeDetails.name,
      type: nodeDetails.type,
      extension: nodeDetails.extension,
      size: nodeDetails.size,
      createdAt: nodeDetails.createdAt,
      modifiedAt: nodeDetails.modifiedAt,
      depth: nodeDetails.depth,
      relationships: nodeDetails.relationships,
    };
  } catch (error) {
    console.error('Failed to get node metadata:', error);
    return null;
  }
}
