import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { TweetDao } from './tweet.dao.js';
import { TweetService } from './tweet.service.js';
import { TweetController } from './tweet.controller.js';
import { tweetRoutes } from './tweet.routes.js';

const tweetModule: FastifyPluginAsync = async (server) => {
  const tweetDao = new TweetDao(server.prisma);
  const tweetService = new TweetService(tweetDao);
  const tweetController = new TweetController(tweetService);

  tweetRoutes(server, tweetController);
};

export default fp(tweetModule, {
  dependencies: ['prismaPlugin'],
  name: 'tweetModule',
});
