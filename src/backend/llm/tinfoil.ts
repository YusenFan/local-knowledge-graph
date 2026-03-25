/**
 * Tinfoil LLM Integration
 * Confidential AI / TEE-compliant LLM service
 */

import fetch from 'node-fetch';

// Tinfoil Configuration
const TINFOIL_CONFIG = {
  apiKey: process.env.TINFOIL_API_KEY || '',
  apiUrl: process.env.TINFOIL_API_URL || 'https://api.tinfoil.ai/v1',
  maxRetries: 3,
  timeout: 30000,
};

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
}

/**
 * Generate completion using Tinfoil API
 */
export async function generateCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const {
    apiKey,
    apiUrl,
    maxRetries,
    timeout,
  } = TINFOIL_CONFIG;

  const model = options.model || process.env.TINFOIL_MODEL || 'tinfoil-1b';

  if (!apiKey) {
    throw new Error('TINFOIL_API_KEY is not configured');
  }

  const requestPayload = {
    model: model,
    prompt: prompt,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
    stream: options.stream || false,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tinfoil API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as any;

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No choices returned from Tinfoil API');
      }

      if (!data.choices[0].message) {
        throw new Error('No message in Tinfoil API response');
      }

      return data.choices[0].message.content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Tinfoil API attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

/**
 * Generate node summary for file/directory
 */
export async function generateNodeSummary(
  nodeName: string,
  nodeType: 'file' | 'directory',
  context: {
    path: string;
    extension?: string;
    size?: number;
    siblings: string[];
    parent?: string;
    children: string[];
  }
): Promise<string> {
  const prompt = `You are a knowledgeable assistant analyzing a file system structure.
Generate a concise markdown summary for the following ${nodeType}:

${nodeName}
Path: ${context.path}
${context.extension ? `Extension: ${context.extension}` : ''}
${context.size ? `Size: ${formatSize(context.size)}` : ''}
${context.siblings.length ? `Siblings: ${context.siblings.slice(0, 5).join(', ')}${context.siblings.length > 5 ? '...' : ''}` : ''}
${context.parent ? `Parent: ${context.parent}` : ''}
${context.children.length ? `Children: ${context.children.length} items` : ''}

Requirements:
- Provide a brief, concise summary
- Infer the purpose of this ${nodeType} (what it might be used for)
- Suggest relevant tags (2-5 tags)
- Keep the summary under 200 words
- Use markdown format
- Be specific and factual

Generate the summary now:`;

  try {
    const summary = await generateCompletion(prompt, {
      temperature: 0.5,
      maxTokens: 500,
    });

    return summary;
  } catch (error) {
    console.error('Failed to generate node summary:', error);
    throw error;
  }
}

/**
 * Generate query response based on graph context
 */
export async function generateQueryResponse(
  query: string,
  graphContext: {
    totalNodes: number;
    nodeTypes: Record<string, number>;
    recentNodes: Array<{
      name: string;
      type: string;
      path: string;
    }>;
  }
): Promise<string> {
  const prompt = `You are a helpful assistant answering questions about a file system knowledge graph.

User Query: ${query}

Graph Context:
- Total nodes: ${graphContext.totalNodes}
- Node types: ${JSON.stringify(graphContext.nodeTypes)}
- Recent nodes: ${graphContext.recentNodes.slice(0, 10).map(n => `- ${n.name} (${n.type})`).join('\n')}

Instructions:
- Answer the user's question based on the graph context
- If the question is about finding specific files, suggest relevant paths
- If the question is about structure, explain the organization
- Be concise and helpful
- If you don't have enough information, say what you know
- Keep the response under 300 words

Generate the answer now:`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 400,
    });

    return response;
  } catch (error) {
    console.error('Failed to generate query response:', error);
    throw error;
  }
}

/**
 * Format file size for human readability
 */
function formatSize(bytes?: number): string {
  if (!bytes) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB'];
  const size = bytes;
  const unitIndex = Math.floor(Math.log(size) / Math.log(1024));
  const formattedSize = (size / Math.pow(1024, unitIndex)).toFixed(1);

  return `${formattedSize} ${units[unitIndex]}`;
}

/**
 * Check if Tinfoil API is properly configured
 */
export async function checkConfig(): Promise<boolean> {
  const { apiKey, apiUrl } = TINFOIL_CONFIG;

  if (!apiKey) {
    console.warn('TINFOIL_API_KEY not set in environment variables');
    return false;
  }

  if (!apiUrl) {
    console.warn('TINFOIL_API_URL not set in environment variables');
    return false;
  }

  return true;
}

/**
 * Test Tinfoil API connection
 */
export async function testConnection(): Promise<boolean> {
  if (!(await checkConfig())) {
    console.warn('Skipping connection test - Tinfoil API not configured');
    return false;
  }

  try {
    const testPrompt = 'Hello, are you working?';
    const response = await generateCompletion(testPrompt, {
      maxTokens: 20,
    });

    console.log('Tinfoil API test successful:', response);
    return true;
  } catch (error) {
    console.error('Tinfoil API test failed:', error);
    return false;
  }
}
