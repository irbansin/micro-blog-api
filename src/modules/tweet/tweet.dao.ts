import { VisibilityType } from '../../../generated/prisma/client.js';
import { prisma as defaultPrisma } from '../../lib/prisma.js';
import type { CreateTweetInput, RawTweetRow, TimelineQuery } from './tweet.models.js';

type PrismaClient = typeof defaultPrisma;

export class TweetDao {
  constructor(private prisma: PrismaClient) {}

  async createTweet(input: CreateTweetInput) {
    const { authorId, companyId, content, visibilityType, departmentIds } = input;

    return this.prisma.$transaction(async (tx) => {
      const tweet = await tx.tweet.create({
        data: {
          content,
          visibilityType,
          companyId,
          authorId,
          ...(visibilityType !== VisibilityType.COMPANY &&
          departmentIds &&
          departmentIds.length > 0
            ? {
                targetDepartments: {
                  create: departmentIds.map((deptId) => ({
                    department: { connect: { id: deptId, companyId } },
                    company: { connect: { id: companyId } },
                  })),
                },
              }
            : {}),
        },
        include: {
          targetDepartments: {
            select: { departmentId: true },
          },
          author: {
            select: { id: true, username: true },
          },
        },
      });

      return tweet;
    });
  }

  async getTimeline({ userId, companyId, limit = 20, offset = 0 }: TimelineQuery): Promise<RawTweetRow[]> {
    return this.prisma.$queryRaw<RawTweetRow[]>`
      WITH RECURSIVE subdepts AS (
        -- Base: departments directly targeted by D_AND_S tweets
        SELECT tv."departmentId", tv."tweetId"
        FROM "TweetVisibility" tv
        JOIN "Tweet" t ON t.id = tv."tweetId"
        WHERE t."companyId" = ${companyId}
          AND t."visibilityType" = 'DEPARTMENTS_AND_SUBDEPARTMENTS'

        UNION ALL

        -- Recursive: child departments within the same tenant
        SELECT d.id AS "departmentId", sd."tweetId"
        FROM "Department" d
        JOIN subdepts sd ON d."parentId" = sd."departmentId"
        WHERE d."companyId" = ${companyId}
      )
      SELECT
        t.id,
        t.content,
        t."visibilityType",
        t."authorId",
        t."companyId",
        t."createdAt"
      FROM "Tweet" t
      WHERE t."companyId" = ${companyId}
        AND (
          -- COMPANY: visible to everyone in the tenant
          t."visibilityType" = 'COMPANY'

          -- DEPARTMENTS: user must be directly in one of the target departments
          OR (
            t."visibilityType" = 'DEPARTMENTS'
            AND EXISTS (
              SELECT 1
              FROM "TweetVisibility" tv
              JOIN "UserDepartments" ud
                ON ud."departmentId" = tv."departmentId"
               AND ud."companyId"    = ${companyId}
              WHERE tv."tweetId" = t.id
                AND ud."userId"  = ${userId}
            )
          )

          -- DEPARTMENTS_AND_SUBDEPARTMENTS: user in target dept or any descendant
          OR (
            t."visibilityType" = 'DEPARTMENTS_AND_SUBDEPARTMENTS'
            AND EXISTS (
              SELECT 1
              FROM subdepts sd
              JOIN "UserDepartments" ud
                ON ud."departmentId" = sd."departmentId"
               AND ud."companyId"    = ${companyId}
              WHERE sd."tweetId" = t.id
                AND ud."userId"  = ${userId}
            )
          )
        )
      ORDER BY t."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  }
}
