/**
 * Core type definitions for the Local Knowledge Graph system
 */

// File system scanning
export interface ScanOptions {
  targetPath: string;
  includeHidden?: boolean;
  fileExtensions?: string[];
  maxDepth?: number;
}

export interface FileNode {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
  depth: number;
  parentId?: string;
}

export interface ScanResult {
  nodes: FileNode[];
  stats: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    scanTime: number;
  };
}

// Graph database
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Markdown nodes
export interface MarkdownNode {
  id: string; // Corresponds to file node ID
  filePath: string; // Path to markdown file
  summary: string;
  tags: string[];
  inferredPurpose: string;
  relationships: {
    type: string;
    targetId: string;
    description: string;
  }[];
  quickAccess: {
    loadContentPath: string;
  };
  generatedAt: Date;
}

// LLM interactions
export interface LLMGenerateSummaryRequest {
  node: FileNode;
  context: {
    siblings: FileNode[];
    parent?: FileNode;
    children: FileNode[];
  };
}

export interface LLMGenerateSummaryResponse {
  summary: string;
  tags: string[];
  inferredPurpose: string;
}

// API
export interface ScanDirectoryRequest {
  path: string;
  options?: Partial<ScanOptions>;
}

export interface ScanDirectoryResponse {
  success: boolean;
  result?: ScanResult;
  error?: string;
}

export interface QueryRequest {
  query: string;
  includeContent?: boolean;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  content?: any;
}

export interface LoadContentRequest {
  nodeId: string;
}

export interface LoadContentResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Graph visualization
export interface GraphViewNode {
  id: string;
  label: string;
  type: 'directory' | 'file' | 'project' | 'module';
  properties: Record<string, any>;
  hasSummary: boolean;
}

export interface GraphViewEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface GraphViewData {
  nodes: GraphViewNode[];
  edges: GraphViewEdge[];
}
