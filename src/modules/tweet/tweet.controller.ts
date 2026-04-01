import type { FastifyRequest, FastifyReply } from 'fastify';
import { TweetService } from './tweet.service.js';
import type { VisibilityType } from '../../../generated/prisma/client.js';

export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  createTweet = async (
    request: FastifyRequest<{
      Body: {
        content: string;
        visibilityType: VisibilityType;
        departmentIds?: string[];
      };
    }>,
    reply: FastifyReply,
  ) => {
    const input: any = {
      authorId: request.userId,
      companyId: request.companyId,
      content: request.body.content,
      visibilityType: request.body.visibilityType,
    };
    if (request.body.departmentIds !== undefined) {
      input.departmentIds = request.body.departmentIds;
    }

    const tweet = await this.tweetService.createTweet(input);
    return reply.status(201).send(tweet);
  };

  getTimeline = async (
    request: FastifyRequest<{
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply,
  ) => {
    const limit = request.query.limit ?? 20;
    const offset = request.query.offset ?? 0;
    const tweets = await this.tweetService.getTimeline({
      userId: request.userId,
      companyId: request.companyId,
      limit,
      offset,
    });
    return reply.status(200).send(tweets);
  };
}
