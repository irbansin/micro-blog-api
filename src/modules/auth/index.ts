import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

import { authRoutes } from './auth.routes.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthDao } from './auth.dao.js';

const authModule: FastifyPluginAsync = async (server) => {
  const authDao = new AuthDao(server.prisma);
  const authService = new AuthService(authDao, server);
  const authController = new AuthController(authService);

  authRoutes(server, authController);
};

export default fp(authModule, {
  dependencies: ['prismaPlugin'],
  name: 'authModule',
});
