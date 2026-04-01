import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../plugins/auth.js';
import type { TweetController } from './tweet.controller.js';
import type { VisibilityType } from '../../../generated/prisma/client.js';

interface CreateTweetBody {
  content: string;
  visibilityType: VisibilityType;
  departmentIds?: string[];
}

export function tweetRoutes(server: FastifyInstance, controller: TweetController) {
  server.post<{ Body: CreateTweetBody }>(
    '/tweets',
    {
      preHandler: [requireAuth],
      schema: {
        body: {
          type: 'object',
          required: ['content', 'visibilityType'],
          properties: {
            content: { type: 'string', minLength: 1, maxLength: 280 },
            visibilityType: {
              type: 'string',
              enum: [
                'COMPANY',
                'DEPARTMENTS',
                'DEPARTMENTS_AND_SUBDEPARTMENTS',
              ],
            },
            departmentIds: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    controller.createTweet,
  );

  server.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/timeline',
    {
      preHandler: [requireAuth],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit:  { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 },
          },
        },
      },
    },
    controller.getTimeline,
  );
}
