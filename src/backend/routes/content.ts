/**
 * API routes for loading file content on-demand
 */

import { FastifyInstance } from 'fastify';
import { LoadContentRequest, LoadContentResponse } from '../../shared/types.js';

export default async function contentRoutes(fastify: FastifyInstance) {
  /**
   * Load file content for a specific node
   */
  fastify.post<{ Body: LoadContentRequest }>(
    '/',
    {
      schema: {
        description: 'Load the original file content for a specific node',
        tags: ['Content'],
        body: {
          type: 'object',
          required: ['nodeId'],
          properties: {
            nodeId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              content: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { nodeId } = request.body;

        // Import content loader
        const { loadNodeContent } = await import('../scanner/content.js');

        const result: LoadContentResponse = await loadNodeContent(nodeId);

        return reply.send(result);
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
   * Get file metadata (without content)
   */
  fastify.get<{ Params: { nodeId: string } }>(
    '/:nodeId/metadata',
    {
      schema: {
        description: 'Get file metadata without loading content',
        tags: ['Content'],
        params: {
          type: 'object',
          required: ['nodeId'],
          properties: {
            nodeId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { nodeId } = request.params;

        // Import metadata reader
        const { getNodeMetadata } = await import('../scanner/metadata.js');

        const metadata = await getNodeMetadata(nodeId);

        if (!metadata) {
          return reply.status(404).send({
            error: 'Node not found',
          });
        }

        return reply.send(metadata);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}
