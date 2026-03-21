/**
 * API routes for graph operations
 */

import { FastifyInstance } from 'fastify';
import { GraphViewData } from '../../shared/types.js';

export default async function graphRoutes(fastify: FastifyInstance) {
  /**
   * Get the full graph visualization data
   */
  fastify.get<{ Querystring: { limit?: number } }>(
    '/',
    {
      schema: {
        description: 'Get the full graph for visualization',
        tags: ['Graph'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    properties: { type: 'object' },
                    hasSummary: { type: 'boolean' },
                  },
                },
              },
              edges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    source: { type: 'string' },
                    target: { type: 'string' },
                    type: { type: 'string' },
                    label: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit } = request.query;

        // Import graph client
        const { getGraphVisualization } = await import('../graph/client.js');

        const graphData: GraphViewData = await getGraphVisualization(limit);

        return reply.send(graphData);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * Get a specific node's details
   */
  fastify.get<{ Params: { nodeId: string } }>(
    '/:nodeId',
    {
      schema: {
        description: 'Get details for a specific node',
        tags: ['Graph'],
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

        // Import graph client
        const { getNodeDetails } = await import('../graph/client.js');

        const node = await getNodeDetails(nodeId);

        if (!node) {
          return reply.status(404).send({
            error: 'Node not found',
          });
        }

        return reply.send(node);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * Get a node's Markdown summary
   */
  fastify.get<{ Params: { nodeId: string } }>(
    '/:nodeId/summary',
    {
      schema: {
        description: 'Get the Markdown summary for a specific node',
        tags: ['Graph'],
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

        // Import Markdown reader
        const { getMarkdownNode } = await import('../llm/markdown.js');

        const markdown = await getMarkdownNode(nodeId);

        if (!markdown) {
          return reply.status(404).send({
            error: 'Markdown summary not found',
          });
        }

        return reply.send(markdown);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}
