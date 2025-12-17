import type { Brief } from "@shared/schema";

interface BriefWithOrg extends Brief {
  organization?: {
    name: string;
    slug: string | null;
    logoUrl: string | null;
    website: string | null;
    description: string | null;
  };
}

export function transformBrief(brief: BriefWithOrg) {
  const deadlineDate = typeof brief.deadline === 'string' 
    ? new Date(brief.deadline) 
    : brief.deadline;
  
  const createdAtDate = typeof brief.createdAt === 'string'
    ? new Date(brief.createdAt)
    : brief.createdAt;

  const rawAmount = brief.rewardAmount;
  const numericAmount = typeof rawAmount === 'number' 
    ? rawAmount 
    : parseFloat(rawAmount);
  const rewardAmount = isNaN(numericAmount) ? rawAmount : numericAmount;

  const org = brief.organization || {
    name: brief.orgName,
    slug: null,
    logoUrl: null,
    website: null,
    description: null,
  };

  return {
    id: String(brief.id),
    slug: brief.slug,
    title: brief.title,
    orgName: org.name || brief.orgName,
    overview: brief.overview,
    requirements: brief.requirements || [],
    deliverables: {
      ratio: brief.deliverableRatio,
      length: brief.deliverableLength,
      format: brief.deliverableFormat,
    },
    reward: {
      type: brief.rewardType as 'CASH' | 'BONUS_BETS' | 'OTHER',
      amount: rewardAmount,
      currency: brief.rewardCurrency || "USD",
      description: brief.rewardDescription || undefined,
    },
    deadline: deadlineDate.toISOString(),
    status: brief.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    maxWinners: brief.maxWinners ?? 1,
    maxSubmissionsPerCreator: brief.maxSubmissionsPerCreator ?? 3,
    submissionCount: 0,
    createdAt: createdAtDate.toISOString(),
    organization: {
      name: org.name || brief.orgName,
      slug: org.slug || null,
      logoUrl: org.logoUrl || null,
      website: org.website || null,
      description: org.description || null,
    },
  };
}

export type TransformedBrief = ReturnType<typeof transformBrief>;
