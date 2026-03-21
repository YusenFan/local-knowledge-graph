/**
 * Main backend server entry point
 * Fastify + TypeScript + Memgraph + LLM
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import dotenv from 'dotenv';

// Routes
import scanRoutes from './routes/scan.js';
import graphRoutes from './routes/graph.js';
import queryRoutes from './routes/query.js';
import contentRoutes from './routes/content.js';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Local Knowledge Graph API',
      description: 'A graph-first local knowledge system with LLM-powered structural understanding',
      version: '0.1.0',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local development server',
      },
    ],
  },
});

await fastify.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register routes
await fastify.register(scanRoutes, { prefix: '/api/scan' });
await fastify.register(graphRoutes, { prefix: '/api/graph' });
await fastify.register(queryRoutes, { prefix: '/api/query' });
await fastify.register(contentRoutes, { prefix: '/api/content' });

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || 'localhost';

    await fastify.listen({ port, host });

    console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   🧠 Local Knowledge Graph Server Started!              ║
    ║                                                        ║
    ║   Server: http://${host}:${port}                         ║
    ║   Docs:   http://${host}:${port}/docs                  ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
