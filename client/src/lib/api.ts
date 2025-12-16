import type { Brief, Submission, InsertBrief, InsertSubmission } from "@shared/schema";

// Briefs API
export async function fetchBriefs(): Promise<Brief[]> {
  const response = await fetch("/api/briefs");
  if (!response.ok) throw new Error("Failed to fetch briefs");
  return response.json();
}

export async function fetchBriefBySlug(slug: string): Promise<Brief> {
  const response = await fetch(`/api/briefs/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch brief");
  return response.json();
}

export async function createBrief(brief: InsertBrief): Promise<Brief> {
  const response = await fetch("/api/briefs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brief),
  });
  if (!response.ok) throw new Error("Failed to create brief");
  return response.json();
}

// Submissions API
export async function fetchSubmissions(briefId: number): Promise<Submission[]> {
  const response = await fetch(`/api/briefs/${briefId}/submissions`);
  if (!response.ok) throw new Error("Failed to fetch submissions");
  return response.json();
}

export async function createSubmission(submission: InsertSubmission): Promise<Submission> {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!response.ok) throw new Error("Failed to create submission");
  return response.json();
}

export async function updateSubmissionStatus(id: number, status: string): Promise<Submission> {
  const response = await fetch(`/api/submissions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update submission status");
  return response.json();
}

export async function updateSubmissionPayout(id: number, payoutStatus: string, notes?: string): Promise<Submission> {
  const response = await fetch(`/api/submissions/${id}/payout`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payoutStatus, notes }),
  });
  if (!response.ok) throw new Error("Failed to update payout");
  return response.json();
}
