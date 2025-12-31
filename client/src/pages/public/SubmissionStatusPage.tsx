import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, Search, RefreshCw, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { Submission, Feedback } from "@shared/schema";
import { useLocation } from "wouter";

// Mock function to get submission by email and submission ID
async function fetchSubmissionStatus(email: string, submissionId: string): Promise<{ submission: Submission | null, feedback: Feedback[] }> {
  // In production, this would be an API call that validates the email matches the submission
  // For demo, return mock data
  if (email && submissionId) {
    const mockSubmission: Submission = {
      id: parseInt(submissionId),
      briefId: 1,
      creatorId: null,
      creatorName: "John Doe",
      creatorEmail: email,
      creatorPhone: "+1234567890",
      creatorHandle: "@johndoe",
      creatorBettingAccount: "john123",
      message: "Here's my submission!",
      videoUrl: "https://example.com/video.mp4",
      videoFileName: "submission.mp4",
      videoMimeType: "video/mp4",
      videoSizeBytes: 10485760,
      status: "IN_REVIEW",
      payoutStatus: "NOT_APPLICABLE",
      payoutAmount: null,
      payoutNotes: null,
      reviewedBy: null,
      reviewNotes: null,
      selectedAt: null,
      paidAt: null,
      submittedAt: new Date("2024-01-10"),
      hasFeedback: 1
    };

    const mockFeedback: Feedback[] = [
      {
        id: 1,
        submissionId: parseInt(submissionId),
        authorId: "admin-1",
        authorName: "Admin",
        comment: "Great video! However, please make sure to mention the promo code more prominently in the first 10 seconds.",
        requiresAction: 1,
        isRead: 0,
        createdAt: new Date("2024-01-11"),
        updatedAt: new Date("2024-01-11")
      },
      {
        id: 2,
        submissionId: parseInt(submissionId),
        authorId: "admin-1",
        authorName: "Admin",
        comment: "The lighting looks good and the energy is perfect for our brand!",
        requiresAction: 0,
        isRead: 1,
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-12")
      }
    ];

    return { submission: mockSubmission, feedback: mockFeedback };
  }
  
  return { submission: null, feedback: [] };
}

export default function SubmissionStatusPage() {
  const [email, setEmail] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocation] = useLocation();

  const { data, refetch } = useQuery({
    queryKey: ["submission-status", email, submissionId],
    queryFn: () => fetchSubmissionStatus(email, submissionId),
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && submissionId) {
      setIsSearching(true);
      await refetch();
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SELECTED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "NOT_SELECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "IN_REVIEW":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "SELECTED":
        return "Congratulations! Your submission has been selected.";
      case "NOT_SELECTED":
        return "Thank you for your submission. Unfortunately, it was not selected this time.";
      case "IN_REVIEW":
        return "Your submission is currently being reviewed.";
      default:
        return "Your submission has been received.";
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">Check Submission Status</h1>
          <p className="text-muted-foreground">Enter your details to view your submission status and feedback</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Submission</CardTitle>
            <CardDescription>Enter the email address and submission ID from your confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="submissionId">Submission ID</Label>
                  <Input
                    id="submissionId"
                    placeholder="12345"
                    value={submissionId}
                    onChange={(e) => setSubmissionId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSearching} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Check Status"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {data?.submission && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Submission Status</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.submission.status)}
                    <Badge variant="outline" className={
                      data.submission.status === 'SELECTED' ? 'bg-green-50 text-green-700 border-green-200' :
                      data.submission.status === 'NOT_SELECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      data.submission.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      ''
                    }>
                      {data.submission.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>{getStatusMessage(data.submission.status)}</AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2 text-sm">
                  <div><strong>Submitted:</strong> {format(new Date(data.submission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</div>
                  <div><strong>Video:</strong> {data.submission.videoFileName}</div>
                  {data.submission.status === 'SELECTED' && data.submission.payoutStatus === 'PENDING' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        Your payout is being processed. You'll receive an email once it's complete.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {data.feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Feedback from Reviewer
                  </CardTitle>
                  <CardDescription>
                    {data.feedback.some(f => f.requiresAction === 1) && (
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Some feedback requires your action
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.feedback.map((feedback) => (
                      <div 
                        key={feedback.id} 
                        className={`p-4 rounded-lg border ${
                          feedback.requiresAction === 1 
                            ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10' 
                            : 'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {feedback.requiresAction === 1 && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                                Action Required
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(feedback.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                          {feedback.isRead === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">New</span>
                          )}
                        </div>
                        <p className="text-sm">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resubmission Section for Rejected Submissions */}
            {data.submission.status === 'NOT_SELECTED' && data.submission.allowsResubmission === 1 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    Resubmission Available
                  </CardTitle>
                  <CardDescription>
                    You can submit a new version of your video based on the feedback provided.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please review the feedback above before creating your new submission. Make sure to address any concerns raised by the reviewer.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={() => {
                        // Navigate to submission form with resubmission data
                        // In production, this would pass the original submission ID
                        setLocation(`/b/${data.submission.briefId}/submit?resubmit=${data.submission.id}`);
                      }}
                      className="w-full"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Submit New Version
                    </Button>
                    
                    {data.submission.submissionVersion && data.submission.submissionVersion > 1 && (
                      <p className="text-sm text-muted-foreground text-center">
                        This is version {data.submission.submissionVersion} of your submission
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {data && !data.submission && isSearching === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No submission found with the provided details. Please check your email and submission ID.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PublicLayout>
  );
}