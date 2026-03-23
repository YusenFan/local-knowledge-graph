// API Client for Local Knowledge Graph Backend
import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ScanOptions {
  maxDepth?: number;
  includeHidden?: boolean;
  fileExtensions?: string[];
}

export interface ScanResult {
  success: boolean;
  result?: {
    nodes: any[];
    stats: {
      totalFiles: number;
      totalDirectories: number;
      totalSize: number;
      scanTime: number;
    };
  };
  error?: string;
}

export interface GraphData {
  nodes: any[];
  edges: any[];
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  content?: any;
}

export interface NodeDetails {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'directory';
  properties: any;
  relationships: any[];
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const backendAPI = {
  // Health Check
  getHealth: async (): Promise<AxiosResponse<any>> => {
    return api.get('/health', { baseURL: 'http://localhost:3000' });
  },

  // Scan
  scanDirectory: async (path: string, options: ScanOptions = {}): Promise<AxiosResponse<ScanResult>> => {
    return api.post('/scan', { path, options });
  },

  // Graph
  getGraph: async (limit?: number): Promise<AxiosResponse<GraphData>> => {
    return api.get('/graph', { params: { limit } });
  },

  getNode: async (id: string): Promise<AxiosResponse<NodeDetails>> => {
    return api.get(`/graph/${id}`);
  },

  getNodeSummary: async (id: string): Promise<AxiosResponse<string>> => {
    return api.get(`/graph/${id}/summary`);
  },

  // Query
  queryGraph: async (query: string): Promise<AxiosResponse<QueryResponse>> => {
    return api.post('/query', { query });
  },

  getQuerySuggestions: async (): Promise<AxiosResponse<string[]>> => {
    return api.get('/query/suggestions');
  },

  // Content
  loadContent: async (nodeId: string): Promise<AxiosResponse<any>> => {
    return api.post('/content', { nodeId });
  },
};

export default backendAPI;
