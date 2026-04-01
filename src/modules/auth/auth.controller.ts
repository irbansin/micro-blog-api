import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import { LoginBody, RegisterBody } from "./auth.models.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (
    req: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ) => {
    const result = await this.authService.register(req.body);
    reply.status(201).send(result);
  };

  login = async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const result = await this.authService.login(req.body);
      reply.status(200).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      reply.status(401).send({ error: message });
    }
  }
}
