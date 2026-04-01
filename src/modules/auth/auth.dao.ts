import { prisma as defaultPrisma } from '../../lib/prisma.js';
import type {

} from './auth.models.js';

type PrismaClient = typeof defaultPrisma;

export class AuthDao {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: { username: string; email: string; password: string; companyId: string }) {
    return this.prisma.user.create({
      data,
    });
  }
}