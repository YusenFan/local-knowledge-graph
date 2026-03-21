/**
 * API routes for directory scanning
 */

import { FastifyInstance } from 'fastify';
import { ScanDirectoryRequest, ScanDirectoryResponse } from '../../shared/types.js';

export default async function scanRoutes(fastify: FastifyInstance) {
  /**
   * Scan a directory and build the initial graph
   */
  fastify.post<{ Body: ScanDirectoryRequest }>(
    '/',
    {
      schema: {
        description: 'Scan a directory and build the initial knowledge graph',
        tags: ['Scan'],
        body: {
          type: 'object',
          required: ['path'],
          properties: {
            path: { type: 'string' },
            options: {
              type: 'object',
              properties: {
                includeHidden: { type: 'boolean' },
                fileExtensions: { type: 'array', items: { type: 'string' } },
                maxDepth: { type: 'number' },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              result: {
                type: 'object',
                properties: {
                  nodes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        path: { type: 'string' },
                        name: { type: 'string' },
                        type: { type: 'string' },
                        size: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        modifiedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  stats: {
                    type: 'object',
                    properties: {
                      totalFiles: { type: 'number' },
                      totalDirectories: { type: 'number' },
                      totalSize: { type: 'number' },
                      scanTime: { type: 'number' },
                    },
                  },
                },
              },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { path: targetPath, options = {} } = request.body;

        // Validate path
        if (!targetPath || targetPath.trim() === '') {
          return reply.status(400).send({
            success: false,
            error: 'Path is required',
          });
        }

        // Import scanner dynamically to avoid initialization issues
        const { scanDirectory } = await import('../scanner/index.js');

        // Scan the directory
        const result = await scanDirectory(targetPath, options);

        // Import graph builder
        const { buildGraphFromScan } = await import('../graph/builder.js');

        // Build graph from scan result
        await buildGraphFromScan(result.nodes);

        // Import Markdown generator
        const { generateMarkdownNodes } = await import('../llm/markdown.js');

        // Generate Markdown summaries for nodes
        await generateMarkdownNodes(result.nodes);

        return reply.send({
          success: true,
          result,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * Get scan status
   */
  fastify.get('/status', {
    schema: {
      description: 'Get the status of the current scan',
      tags: ['Scan'],
      response: {
        200: {
          type: 'object',
          properties: {
            hasScanned: { type: 'boolean' },
            lastScanPath: { type: 'string' },
            lastScanTime: { type: 'string', format: 'date-time' },
            totalNodes: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implement scan status tracking
      return reply.send({
        hasScanned: false,
        lastScanPath: null,
        lastScanTime: null,
        totalNodes: 0,
      });
    }
  );
}
