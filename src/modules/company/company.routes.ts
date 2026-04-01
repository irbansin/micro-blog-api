import type { FastifyInstance } from "fastify";
import type { CompanyController } from "./company.controller.js";
import { requireAuth, requireRole } from "@/plugins/auth.js";

export function companyRoutes(
  server: FastifyInstance,
  controller: CompanyController,
) {
  // ── POST /companies ────────────────────────────────────────────────────────
  server.post<{ Body: { name: string } }>(
    "/companies",
    {
      preHandler: [requireAuth, requireRole("ADMIN")],
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
          },
        },
      },
    },
    controller.createCompany,
  );

  // ── POST /companies/:companyId/users ──────Restricted to avoid direct user creation───────────────────────
  // server.post<{
  //   Params: { companyId: string };
  //   Body: { username: string; email: string };
  // }>(
  //   "/companies/:companyId/users",
  //   {
  //     preHandler: [requireAuth, requireRole("ADMIN")],
  //     schema: {
  //       params: {
  //         type: "object",
  //         required: ["companyId"],
  //         properties: { companyId: { type: "string" } },
  //       },
  //       body: {
  //         type: "object",
  //         required: ["username", "email"],
  //         properties: {
  //           username: { type: "string", minLength: 1, maxLength: 100 },
  //           email: { type: "string", minLength: 1, maxLength: 255 },
  //         },
  //       },
  //     },
  //   },
  //   controller.createUser,
  // );

  // ── POST /companies/:companyId/departments ─────────────────────────────────
  server.post<{
    Params: { companyId: string };
    Body: { name: string; parentId?: string };
  }>(
    "/companies/:companyId/departments",
    {
      preHandler: [requireAuth, requireRole("ADMIN")],

      schema: {
        params: {
          type: "object",
          required: ["companyId"],
          properties: { companyId: { type: "string" } },
        },
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            parentId: { type: "string" },
          },
        },
      },
    },
    controller.createDepartment,
  );

  // ── POST /companies/:companyId/departments/:departmentId/members ───────────
  server.post<{
    Params: { companyId: string; departmentId: string };
    Body: { userId: string };
  }>(
    "/companies/:companyId/departments/:departmentId/members",
    {
      preHandler: [requireAuth, requireRole("ADMIN")],

      schema: {
        params: {
          type: "object",
          required: ["companyId", "departmentId"],
          properties: {
            companyId: { type: "string" },
            departmentId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", minLength: 1 },
          },
        },
      },
    },
    controller.addDepartmentMember,
  );
}
