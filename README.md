# micro-blog-backend


A small multi-tenant micro-blog backend built with Node.js, TypeScript, Fastify, Prisma and PostgreSQL. This repository contains the API server, Prisma schema and supporting scripts used for the coding test.

This README documents how to get the project running, the environment variables required, the main features and how to interact with the API (including authentication and example requests).

## Table of contents
- Project overview
- Quickstart (development)
- Environment variables
- Database setup and Prisma
- Running the server
- API overview and examples
- Authentication
- Testing
- Project structure
- Design notes
- Troubleshooting

## Project overview

Core technologies:
- Node.js + TypeScript
- Fastify (HTTP server)
- Prisma (ORM)
- PostgreSQL (database)

Main features:
- Multi-tenant data model (tenant = Company)
- User authentication (JWT)
- Departments with hierarchical parent/child relationships
- Tweets with visibility rules (company, departments, departments+subdepartments)
- Swagger/OpenAPI documentation

## Quickstart (development)

Prerequisites:
- Node.js v20+
- PostgreSQL 14+

Install dependencies:

```bash
npm install
```

Create a `.env` in the project root with the values described in the next section.

Run migrations, generate the Prisma client and seed example data:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Start the dev server (watch mode):

```bash
npm run dev
```

Server will run on http://localhost:3000 by default.

## Environment variables

Create a `.env` file in the project root. Required variables:

- DATABASE_URL — PostgreSQL connection string (e.g. postgres://user:pass@localhost:5432/dbname)
- JWT_SECRET — secret used to sign JWT tokens

Example `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/micro_blog"
JWT_SECRET="change-this-in-production"
```

Optional environment variables (useful in CI or production):
- PORT — server port (default 3000)

## Database & Prisma

The Prisma schema is in `prisma/schema.prisma`. Use Prisma CLI to manage schema and data.

Common commands:

```bash
# create/migrate the database schema (dev)
npx prisma migrate dev --name <migration-name>

# generate Prisma client
npx prisma generate

# run seed script
npx prisma db seed

# open Prisma Studio
npx prisma studio
```

Note: This project includes generated Prisma client files under `generated/prisma/` that are used at runtime. If you change the schema, run `npx prisma generate` to refresh the client.

## Running the server

Development (hot reload):

```bash
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

The server listens on the port from `PORT` env or 3000.

## API overview

Swagger/OpenAPI docs are available when the server is running at:

```
http://localhost:3000/docs
```

Top-level routes (example):

- POST /auth/register — register a new user
- POST /auth/login — login and receive a JWT
- GET /companies — list companies
- POST /companies — create company
- GET /departments — list departments (tenant scoped via x-company-id)
- POST /departments — create department
- GET /tweets — list tweets visible to the requesting user
- POST /tweets — create a tweet

Note: Many endpoints require the `x-company-id` header for tenant scoping and an Authorization header for protected actions.

Example curl: register

```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123","companyId":"<company-id>"}'
```

Login example (returns token):

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Use the returned token for authenticated requests:

```
Authorization: Bearer <token>
x-company-id: <company-id>
```

## Authentication

This project uses JWT tokens. Tokens are issued by `POST /auth/login` and `POST /auth/register`. Protect endpoints by adding the header:

```
Authorization: Bearer <jwt>
```

Token lifetime is configured in code (default: 24 hours). The `x-company-id` header must be provided on tenant-scoped requests.

## Testing

There are no automated tests included with the starter. To manually verify behavior:

1. Seed the database `npx prisma db seed`.
2. Register or login a user.
3. Use the Swagger UI or Postman collection to exercise endpoints.

Provided Postman collection: `stmn.postman_collection.json` (import into Postman).

## Project structure

- `src/` — application source
  - `index.ts` — server bootstrap
  - `modules/` — feature modules (auth, company, tweet, etc.)
  - `plugins/` — Fastify plugins (swagger, prisma, auth, error handler)
- `prisma/` — Prisma schema and seed script
- `generated/prisma/` — generated Prisma client

## Design notes

- Multi-tenant by design: `companyId` is present on core entities to ensure tenant isolation.
- Departments support hierarchical relationships via a `parentId` column; recursive queries (CTE) are used where necessary to evaluate sub-department visibility.
- Tweets support visibility scopes: COMPANY, DEPARTMENTS, DEPARTMENTS_AND_SUBDEPARTMENTS. Access checks are enforced in the service layer and at the query level.
- The service and DAO layers centralize business logic and database access respectively. Error handling converts DB constraint errors into structured API errors (e.g., duplicate department names return 409 Conflict).

## Troubleshooting

- Port already in use: kill process using port 3000 or change `PORT` env.
- Prisma client errors after schema changes: run `npx prisma generate`.

## Contributing

This repository is a coding-test template — if you extend it, please maintain clear migration histories and update Prisma client with `npx prisma generate`.

## License

MIT

