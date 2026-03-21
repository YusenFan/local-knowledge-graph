/**
 * API routes for querying the knowledge graph
 */

import { FastifyInstance } from 'fastify';
import { QueryRequest, QueryResponse } from '../../shared/types.js';

export default async function queryRoutes(fastify: FastifyInstance) {
  /**
   * Query the knowledge graph
   */
  fastify.post<{ Body: QueryRequest }>(
    '/',
    {
      schema: {
        description: 'Query the knowledge graph with a natural language question',
        tags: ['Query'],
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            includeContent: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              sources: { type: 'array', items: { type: 'string' } },
              content: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { query, includeContent = false } = request.body;

        // Import query engine
        const { queryGraph } = await import('../graph/query.js');

        const result: QueryResponse = await queryGraph(query, includeContent);

        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * Get query suggestions
   */
  fastify.get('/suggestions', {
    schema: {
      description: 'Get suggested queries based on the graph',
      tags: ['Query'],
      response: {
        200: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implement query suggestions
      return reply.send({
        suggestions: [
          'What modules are in my project?',
          'Which files are related to trading?',
          'Show me the project structure',
          'What are the main directories?',
        ],
      });
    }
  );
}
