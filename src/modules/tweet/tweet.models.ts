import type { VisibilityType } from '../../../generated/prisma/client.js';

// ─── Service inputs ───────────────────────────────────────────────────────────

export interface CreateTweetInput {
  authorId: string;
  companyId: string;
  content: string;
  visibilityType: VisibilityType;
  departmentIds: string[] | undefined;
}

export interface TimelineQuery {
  userId: string;
  companyId: string;
  limit?: number;
  offset?: number;
}

// ─── Raw DB output ────────────────────────────────────────────────────────────

export interface RawTweetRow {
  id: string;
  content: string;
  visibilityType: VisibilityType;
  authorId: string;
  companyId: string;
  createdAt: Date;
}
