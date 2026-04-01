import { VisibilityType } from '../../../generated/prisma/client.js';
import { TweetDao } from './tweet.dao.js';
import { ApiError } from '../../errors/ApiError.js';
import type { CreateTweetInput, RawTweetRow, TimelineQuery } from './tweet.models.js';

export class TweetService {
  constructor(private readonly tweetDao: TweetDao) {}

  async createTweet(input: CreateTweetInput) {
    const { visibilityType, departmentIds } = input;

    if (visibilityType !== VisibilityType.COMPANY) {
      if (!departmentIds || departmentIds.length === 0) {
        throw new ApiError('departmentIds is required for non-COMPANY visibility', 400);
      }
    }

    return this.tweetDao.createTweet(input);
  }

  async getTimeline(query: TimelineQuery): Promise<RawTweetRow[]> {
    return this.tweetDao.getTimeline(query);
  }
}
