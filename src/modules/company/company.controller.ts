import type { FastifyRequest, FastifyReply } from 'fastify';
import { CompanyService } from './company.service.js';

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  createCompany = async (
    request: FastifyRequest<{ Body: { name: string } }>,
    reply: FastifyReply,
  ) => {
    const company = await this.companyService.createCompany({
      name: request.body.name,
    });
    return reply.status(201).send(company);
  };

  // createUser route is disabled — user creation goes through POST /register
  // createUser = async (
  //   request: FastifyRequest<{
  //     Params: { companyId: string };
  //     Body: { username: string; email: string };
  //   }>,
  //   reply: FastifyReply,
  // ) => {
  //   const user = await this.companyService.createUser({
  //     companyId: request.params.companyId,
  //     username: request.body.username,
  //     email: request.body.email,
  //   });
  //   return reply.status(201).send(user);
  // };

  createDepartment = async (
    request: FastifyRequest<{
      Params: { companyId: string };
      Body: { name: string; parentId?: string };
    }>,
    reply: FastifyReply,
  ) => {
    const input: any = {
      companyId: request.params.companyId,
      name: request.body.name,
    };
    if (request.body.parentId !== undefined) {
      input.parentId = request.body.parentId;
    }
    const dept = await this.companyService.createDepartment(input);
    return reply.status(201).send(dept);
  };

  addDepartmentMember = async (
    request: FastifyRequest<{
      Params: { companyId: string; departmentId: string };
      Body: { userId: string };
    }>,
    reply: FastifyReply,
  ) => {
    const userDept = await this.companyService.addDepartmentMember({
      companyId: request.params.companyId,
      departmentId: request.params.departmentId,
      userId: request.body.userId,
    });
    return reply.status(201).send(userDept);
  };
}
