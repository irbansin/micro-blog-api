import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { CompanyDao } from './company.dao.js';
import { CompanyService } from './company.service.js';
import { CompanyController } from './company.controller.js';
import { companyRoutes } from './company.routes.js';

const companyModule: FastifyPluginAsync = async (server) => {
  const companyDao = new CompanyDao(server.prisma);
  const companyService = new CompanyService(companyDao);
  const companyController = new CompanyController(companyService);

  companyRoutes(server, companyController);
};

export default fp(companyModule, {
  dependencies: ['prismaPlugin'],
  name: 'companyModule',
});
