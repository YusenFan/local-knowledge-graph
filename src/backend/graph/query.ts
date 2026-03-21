/**
 * Query engine - processes natural language queries against the graph
 */

import { QueryRequest, QueryResponse } from '../../shared/types.js';
import { getNodeDetails } from './client.js';
import { getMarkdownNode } from '../llm/markdown.js';

/**
 * Query the knowledge graph with a natural language question
 */
export async function queryGraph(
  query: string,
  includeContent: boolean = false
): Promise<QueryResponse> {
  // Simple keyword-based query for MVP
  // TODO: Integrate LLM for more sophisticated query understanding

  const lowerQuery = query.toLowerCase();
  const sources: string[] = [];
  let answer = '';

  // Detect query type and generate response
  if (lowerQuery.includes('module') || lowerQuery.includes('directory')) {
    answer = await queryModules(lowerQuery);
  } else if (lowerQuery.includes('file') || lowerQuery.includes('type')) {
    answer = await queryFiles(lowerQuery);
  } else if (lowerQuery.includes('trading') || lowerQuery.includes('api')) {
    answer = await queryKeywords(lowerQuery);
  } else {
    answer = await genericQuery(lowerQuery);
  }

  return {
    answer,
    sources,
    content: includeContent ? {} : undefined,
  };
}

/**
 * Query for modules and directories
 */
async function queryModules(query: string): Promise<string> {
  const modules = await findNodesByType('directory');

  if (modules.length === 0) {
    return 'I found no directories in your graph.';
  }

  const topModules = modules.slice(0, 10).map((m: any) => `• ${m.name}`).join('\n');
  return `I found ${modules.length} directories in your graph:\n\n${topModules}`;
}

/**
 * Query for files
 */
async function queryFiles(query: string): Promise<string> {
  const files = await findNodesByType('file');

  if (files.length === 0) {
    return 'I found no files in your graph.';
  }

  // Group by extension
  const byExtension: Record<string, number> = {};
  for (const file of files) {
    const ext = file.extension || 'no-extension';
    byExtension[ext] = (byExtension[ext] || 0) + 1;
  }

  const summary = Object.entries(byExtension)
    .map(([ext, count]) => `• ${ext || 'no-ext'}: ${count} files`)
    .join('\n');

  return `I found ${files.length} files in your graph:\n\n${summary}`;
}

/**
 * Query by keywords
 */
async function queryKeywords(query: string): Promise<string> {
  const allNodes = await findAllNodes();

  const keywords = extractKeywords(query);
  const matches = allNodes.filter((node: any) =>
    keywords.some((keyword: string) =>
      node.name.toLowerCase().includes(keyword)
    )
  );

  if (matches.length === 0) {
    return `I found no nodes matching: ${keywords.join(', ')}`;
  }

  const result = matches.slice(0, 10).map((m: any) => `• ${m.name} (${m.type})`).join('\n');
  return `I found ${matches.length} nodes matching "${keywords.join(', ')}":\n\n${result}`;
}

/**
 * Generic query fallback
 */
async function genericQuery(query: string): Promise<string> {
  const stats = await getGraphStats();

  return `Based on your graph structure:\n\n` +
    `• Total nodes: ${stats.totalNodes}\n` +
    `• Directories: ${stats.directories}\n` +
    `• Files: ${stats.files}\n\n` +
    `I can help you find specific files, understand the project structure, or locate related content. Try asking about "modules", "files", or specific keywords like "trading" or "api".`;
}

/**
 * Find nodes by type
 */
async function findNodesByType(type: string): Promise<any[]> {
  // Import here to avoid circular dependency
  const { driver } = await import('./client.js');

  if (!driver) {
    return [];
  }

  const session = driver.session();

  try {
    const result = await session.run(
      'MATCH (n:FileNode {type: $type}) RETURN n',
      { type }
    );

    return result.records.map((record) => record.get('n').properties);
  } finally {
    await session.close();
  }
}

/**
 * Find all nodes
 */
async function findAllNodes(): Promise<any[]> {
  // Import here to avoid circular dependency
  const { driver } = await import('./client.js');

  if (!driver) {
    return [];
  }

  const session = driver.session();

  try {
    const result = await session.run('MATCH (n:FileNode) RETURN n');

    return result.records.map((record) => record.get('n').properties);
  } finally {
    await session.close();
  }
}

/**
 * Get graph statistics
 */
async function getGraphStats(): Promise<any> {
  const allNodes = await findAllNodes();

  return {
    totalNodes: allNodes.length,
    directories: allNodes.filter((n: any) => n.type === 'directory').length,
    files: allNodes.filter((n: any) => n.type === 'file').length,
  };
}

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  // Simple keyword extraction
  // TODO: Use LLM for better keyword extraction
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'what', 'where', 'how', 'find', 'show', 'me', 'my', 'about', 'all'];

  return query
    .split(/\s+/)
    .map((word) => word.replace(/[^\w]/g, ''))
    .filter((word) => word.length > 2 && !stopWords.includes(word.toLowerCase()));
}
