import fp from 'fastify-plugin';
import type { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';
import '@fastify/jwt';


declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    companyId: string;
    role: string;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { 
      userId: string; 
      companyId: string; 
      role: 'ADMIN' | 'USER'; 
    };
    user: { 
      userId: string; 
      companyId: string; 
      role: 'ADMIN' | 'USER'; 
    };
  }
}

/**
 * Reusable preHandler that enforces x-user-id / x-company-id headers.
 * Apply it per-route rather than globally so unauthenticated setup
 * endpoints (companies, users, departments) are not blocked.
 *
 * Usage in a route:
 *   { preHandler: [requireAuth] }
 */
export const requireAuth: preHandlerHookHandler = async (request, reply) => {
  try {

    await request.jwtVerify();

    request.userId = request.user.userId;
    request.companyId = request.user.companyId;
    request.role = request.user.role;

  } catch (err) {
    // If verification fails (expired, wrong secret, missing token), return 401
    return reply.status(401).send({
      error: 'Unauthorized: Invalid or missing token',
    });
  }
};


/**
 * Higher-order hook to enforce specific roles.
 * Must be used AFTER requireAuth in the preHandler array.
 * 
 * Usage: { preHandler: [requireAuth, requireRole('ADMIN')] }
 */
export type Role = 'ADMIN' | 'USER'; // Add other roles as needed

export const requireRole = (...roles: Role[]): preHandlerHookHandler => {
  return async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized: No user session found' });
    }

    const userRole = request.user.role as Role;
    
    if (!roles.includes(userRole)) {
      return reply.status(403).send({ 
        error: `Forbidden: This resource requires one of the following roles: [${roles.join(', ')}]` 
      });
    }
  };
};



/**
 * Plugin only decorates the request object so the fields are always
 * available to TypeScript—even on unauthenticated routes where they
 * will simply remain empty strings until requireAuth sets them.
 */
const authPlugin: FastifyPluginAsync = fp(async (server) => {
  server.decorateRequest('userId', '');
  server.decorateRequest('companyId', '');
  server.decorateRequest('role', '')
});

export default authPlugin;
