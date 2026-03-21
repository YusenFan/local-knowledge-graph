/**
 * Content loader - loads file content on-demand
 */

import * as fs from 'fs/promises';
import { LoadContentResponse } from '../../shared/types.js';
import { getNodeDetails } from '../graph/client.js';

/**
 * Load node content (file content on-demand)
 */
export async function loadNodeContent(nodeId: string): Promise<LoadContentResponse> {
  try {
    // Get node details from graph
    const nodeDetails = await getNodeDetails(nodeId);

    if (!nodeDetails) {
      return {
        success: false,
        error: 'Node not found in graph',
      };
    }

    // Check if it's a file (not a directory)
    if (nodeDetails.type === 'directory') {
      return {
        success: false,
        error: 'Cannot load content for directory',
      };
    }

    // Read file content
    const content = await fs.readFile(nodeDetails.path, 'utf-8');

    // For binary files, return a note
    if (isBinaryContent(content)) {
      return {
        success: true,
        content: `[Binary file - cannot display text content]\n\nFile type: ${nodeDetails.extension || 'unknown'}`,
      };
    }

    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if content is binary
 */
function isBinaryContent(content: string): boolean {
  // Simple heuristic: if content contains many null bytes or non-printable characters
  const nullCount = (content.match(/\0/g) || []).length;
  return nullCount > 0;
}
