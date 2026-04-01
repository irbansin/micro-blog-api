import fp from 'fastify-plugin';
import type { FastifyError } from 'fastify';
import { ApiError } from '../errors/ApiError.js';

function isPrismaKnownError(error: unknown): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  );
}

export default fp(async (server) => {
  server.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ApiError) {
      server.log.warn({ err: error }, 'ApiError caught');
      return reply.status(error.statusCode).send({ error: error.message });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      server.log.warn({ err: error }, 'Validation error caught');
      return reply.status(400).send({ error: error.message });
    }

    // Handle known Prisma errors that leak through
    if (isPrismaKnownError(error)) {
      server.log.warn({ err: error }, 'Prisma error caught');
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Resource already exists' });
      }
      if (error.code === 'P2025' || error.code === 'P2003') {
        return reply.status(404).send({ error: 'Referenced resource not found' });
      }
    }

    // Default fallback for unexpected errors
    server.log.error({ err: error }, 'Unhandled error caught');
    return reply.status(500).send({ error: 'Internal Server Error' });
  });
});
