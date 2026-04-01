import { AuthDao } from "./auth.dao.js";
import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { LoginBody, RegisterBody } from "./auth.models.js";

export class AuthService {
  constructor(
    private authDao: AuthDao,
    private fastify: FastifyInstance,
  ) {}

  async register(data: RegisterBody) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10); 
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await this.authDao.createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      companyId: data.companyId,
    });

    const token = this.fastify.jwt.sign({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return { token };
  }

  async login(data: LoginBody) {
    const user = await this.authDao.findUserByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error("Invalid email or password");
    }

    const token = this.fastify.jwt.sign({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return { token };
  }
}
