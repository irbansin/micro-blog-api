import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import companyModule from "@/modules/company/index.js";
import tweetModule from "@/modules/tweet/index.js";
import authModule from "@/modules/auth/index.js";
import { fastifyJwt } from "@fastify/jwt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({
  logger: true,
});

const start = async () => {
  try {
    // Load plugins (swagger, prisma, errorHandler, auth)
    await server.register(autoLoad, {
      dir: join(__dirname, "plugins"),
      options: {},
    });

    server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "fallback-secret-for-dev-only",
      sign: {
        expiresIn: "1h",
      },
    });

    // Load feature modules
    await server.register(companyModule);
    await server.register(tweetModule);
    await server.register(authModule);

    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`Server listening on port 3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
