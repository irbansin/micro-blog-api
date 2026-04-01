import { prisma as defaultPrisma } from '../../lib/prisma.js';
import type {
  CreateCompanyInput,
  CreateUserInput,
  CreateDepartmentInput,
  AddDepartmentMemberInput,
} from './company.models.js';

type PrismaClient = typeof defaultPrisma;

export class CompanyDao {
  constructor(private prisma: PrismaClient) {}

  async createCompany(input: CreateCompanyInput) {
    return this.prisma.company.create({
      data: { name: input.name },
    });
  }

  async findCompanyById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async createUser(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        companyId: input.companyId,
        username: input.username,
        email: input.email,
        password: input.password,
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { companyId: true },
    });
  }

  async createDepartment(input: CreateDepartmentInput) {
    const { companyId, name, parentId } = input;
    return this.prisma.department.create({
      data: {
        companyId,
        name,
        ...(parentId ? { parentId } : {}),
      },
    });
  }

  async findDepartmentById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      select: { companyId: true },
    });
  }

  async findDepartmentByNameAndCompany(name: string, companyId: string) {
    return this.prisma.department.findUnique({
      where: {
        companyId_name: {
          companyId,
          name,
        },
      },
    });
  }

  async addDepartmentMember(input: AddDepartmentMemberInput) {
    return this.prisma.userDepartments.create({
      data: {
        userId: input.userId,
        departmentId: input.departmentId,
        companyId: input.companyId,
      },
    });
  }
}
