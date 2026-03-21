/**
 * Directory scanner - scans file system structure without reading content
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ScanOptions, ScanResult, FileNode } from '../../shared/types.js';

/**
 * Scan a directory recursively and extract structural metadata
 */
export async function scanDirectory(
  targetPath: string,
  options: Partial<ScanOptions> = {}
): Promise<ScanResult> {
  const startTime = Date.now();
  const {
    includeHidden = false,
    fileExtensions,
    maxDepth = Infinity,
  } = options;

  // Validate path
  const resolvedPath = path.resolve(targetPath);
  const stats = await fs.stat(resolvedPath);

  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${targetPath}`);
  }

  const nodes: FileNode[] = [];
  let totalSize = 0;

  /**
   * Recursive scan function
   */
  async function scan(
    dirPath: string,
    currentDepth: number,
    parentId?: string
  ): Promise<void> {
    if (currentDepth > maxDepth) {
      return;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files if not included
        if (!includeHidden && entry.name.startsWith('.')) {
          continue;
        }

        const entryPath = path.join(dirPath, entry.name);
        const entryStats = await fs.stat(entryPath);

        // Generate unique node ID
        const nodeId = generateNodeId(entryPath);

        // Check file extension filter
        if (fileExtensions && entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!fileExtensions.includes(ext)) {
            continue;
          }
        }

        const node: FileNode = {
          id: nodeId,
          path: entryPath,
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          extension: entry.isFile() ? path.extname(entry.name) : undefined,
          size: entry.isFile() ? entryStats.size : undefined,
          createdAt: entryStats.birthtime,
          modifiedAt: entryStats.mtime,
          depth: currentDepth,
          parentId,
        };

        nodes.push(node);

        if (entry.isFile()) {
          totalSize += entryStats.size || 0;
        }

        // Recursively scan subdirectories
        if (entry.isDirectory()) {
          await scan(entryPath, currentDepth + 1, nodeId);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  // Start scanning
  await scan(resolvedPath, 0);

  // Calculate statistics
  const statsResult = {
    totalFiles: nodes.filter((n) => n.type === 'file').length,
    totalDirectories: nodes.filter((n) => n.type === 'directory').length,
    totalSize,
    scanTime: Date.now() - startTime,
  };

  return {
    nodes,
    stats: statsResult,
  };
}

/**
 * Generate a unique node ID from a file path
 */
function generateNodeId(filePath: string): string {
  // Use a hash-like ID based on the path
  // For simplicity, we use a base64 encoded version of the path
  // In production, you might want to use a proper hash function
  return Buffer.from(filePath).toString('base64').replace(/[/+=]/g, '_');
}

/**
 * Validate if a path is safe to scan (within allowed boundaries)
 */
export async function validatePath(targetPath: string): Promise<boolean> {
  try {
    const resolvedPath = path.resolve(targetPath);
    const stats = await fs.stat(resolvedPath);

    if (!stats.isDirectory()) {
      return false;
    }

    // Additional security checks can be added here
    // For example, checking against allowed base paths

    return true;
  } catch (error) {
    return false;
  }
}
