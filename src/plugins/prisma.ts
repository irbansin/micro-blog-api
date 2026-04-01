import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { PrismaClient } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
  server.decorate('prisma', prisma);

  server.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}, {
  name: 'prismaPlugin'
});

export default prismaPlugin;
