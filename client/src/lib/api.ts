import type { Brief, Submission, InsertBrief, InsertSubmission, Feedback } from "@shared/schema";

// Briefs API
export async function fetchBriefs(): Promise<Brief[]> {
  const response = await fetch("/api/briefs");
  if (!response.ok) throw new Error("Failed to fetch briefs");
  return response.json();
}

export async function fetchBriefBySlug(slug: string): Promise<Brief> {
  const response = await fetch(`/api/briefs/by-slug/${slug}`);
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

export async function updateSubmissionStatus(id: number, status: string, allowsResubmission?: boolean): Promise<Submission> {
  const response = await fetch(`/api/submissions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, allowsResubmission }),
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

// Feedback API
export async function fetchFeedback(submissionId: number): Promise<Feedback[]> {
  const response = await fetch(`/api/submissions/${submissionId}/feedback`);
  if (!response.ok) throw new Error("Failed to fetch feedback");
  return response.json();
}

export async function createFeedback(submissionId: number, comment: string, requiresAction: boolean = false): Promise<Feedback> {
  const response = await fetch(`/api/submissions/${submissionId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment, requiresAction }),
  });
  if (!response.ok) throw new Error("Failed to create feedback");
  return response.json();
}

export async function updateFeedback(feedbackId: number, comment: string): Promise<Feedback> {
  const response = await fetch(`/api/feedback/${feedbackId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  if (!response.ok) throw new Error("Failed to update feedback");
  return response.json();
}

export async function deleteFeedback(feedbackId: number): Promise<void> {
  const response = await fetch(`/api/feedback/${feedbackId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete feedback");
}
