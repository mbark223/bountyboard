import type { Brief } from "@shared/schema";

// Transform database Brief to frontend format
export function transformBrief(brief: Brief) {
  return {
    id: String(brief.id),
    slug: brief.slug,
    title: brief.title,
    orgName: brief.orgName,
    overview: brief.overview,
    requirements: brief.requirements,
    deliverables: {
      ratio: brief.deliverableRatio,
      length: brief.deliverableLength,
      format: brief.deliverableFormat,
    },
    reward: {
      type: brief.rewardType as 'CASH' | 'BONUS_BETS' | 'OTHER',
      amount: isNaN(Number(brief.rewardAmount)) ? brief.rewardAmount : Number(brief.rewardAmount),
      currency: brief.rewardCurrency || "USD",
      description: brief.rewardDescription || undefined,
    },
    deadline: brief.deadline.toISOString(),
    status: brief.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    submissionCount: 0, // TODO: Add count later if needed
    createdAt: brief.createdAt.toISOString(),
  };
}
