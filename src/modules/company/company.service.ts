import { CompanyDao } from './company.dao.js';
import { ApiError } from '../../errors/ApiError.js';
import type {
  CreateCompanyInput,
  CreateUserInput,
  CreateDepartmentInput,
  AddDepartmentMemberInput,
} from './company.models.js';

function isPrismaP2002(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2002'
  );
}

function isPrismaP2025(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2025'
  );
}

export class CompanyService {
  constructor(private readonly companyDao: CompanyDao) {}

  async createCompany(input: CreateCompanyInput) {
    return this.companyDao.createCompany(input);
  }

  async createUser(input: CreateUserInput) {
    const company = await this.companyDao.findCompanyById(input.companyId);
    if (!company) {
      throw new ApiError('Company not found', 404);
    }
    try {
      return await this.companyDao.createUser(input);
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new ApiError('User with this email already exists', 409);
      }
      if (isPrismaP2025(err)) {
        throw new ApiError('Referenced resource not found', 404);
      }
      throw err;
    }
  }

  async createDepartment(input: CreateDepartmentInput) {
    const { companyId, parentId, name } = input;

    const company = await this.companyDao.findCompanyById(companyId);
    if (!company) {
      throw new ApiError('Company not found', 404);
    }

    const existingDepartment = await this.companyDao.findDepartmentByNameAndCompany(name, companyId);
    if (existingDepartment) {
      throw new ApiError('Department already exists', 409);
    }

    if (parentId) {
      const parent = await this.companyDao.findDepartmentById(parentId);
      if (!parent) {
        throw new ApiError('Parent department not found', 404);
      }
      if (parent.companyId !== companyId) {
        throw new ApiError('Parent department belongs to a different company', 400);
      }
    }

    return this.companyDao.createDepartment(input);
  }

  async addDepartmentMember(input: AddDepartmentMemberInput) {
    const { companyId, departmentId, userId } = input;

    const user = await this.companyDao.findUserById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    if (user.companyId !== companyId) {
      throw new ApiError('User belongs to a different company', 400);
    }

    const dept = await this.companyDao.findDepartmentById(departmentId);
    if (!dept) {
      throw new ApiError('Department not found', 404);
    }
    if (dept.companyId !== companyId) {
      throw new ApiError('Department belongs to a different company', 400);
    }

    return this.companyDao.addDepartmentMember(input);
  }
}
