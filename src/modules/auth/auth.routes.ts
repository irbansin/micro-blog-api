import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { AuthDao } from "./auth.dao.js";
import { RegisterBody, LoginBody, ResponseSchema } from "./auth.models.js";

export async function authRoutes(
  server: FastifyInstance,
  controller: AuthController,
) {
  // ── POST /register ────────────────────────────────────────────────────────
  server.post<{ Body: RegisterBody }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "email", "password", "companyId"],
          properties: {
            username: { type: "string", minLength: 1, maxLength: 255 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            companyId: { type: "string", minLength: 1 },
          },
        },
      },
    },
    controller.register,
  );

  // ── POST /login ───────────────────────────────────────────────────────────
    server.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    controller.login,
  );

}

