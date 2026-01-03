import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileVideo, Calendar, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: number;
  briefId: number;
  creatorEmail: string;
  videoFileName: string;
  status: string;
  submittedAt: string;
  message?: string;
  hasFeedback: boolean;
  submissionVersion: number;
}

interface SubmissionHistoryProps {
  email: string;
  briefId?: number;
  onViewSubmission?: (submissionId: number) => void;
}

async function fetchSubmissions(email: string, briefId?: number) {
  const url = briefId 
    ? `/api/influencers/submissions?email=${encodeURIComponent(email)}&briefId=${briefId}`
    : `/api/influencers/submissions?email=${encodeURIComponent(email)}`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch submissions");
  }
  return response.json();
}

const statusConfig = {
  RECEIVED: { label: "Received", icon: Clock, color: "bg-blue-500" },
  IN_REVIEW: { label: "In Review", icon: Clock, color: "bg-yellow-500" },
  SELECTED: { label: "Selected", icon: CheckCircle, color: "bg-green-500" },
  NOT_SELECTED: { label: "Not Selected", icon: X, color: "bg-gray-500" },
};

export function SubmissionHistory({ email, briefId, onViewSubmission }: SubmissionHistoryProps) {
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ["submissions", email, briefId],
    queryFn: () => fetchSubmissions(email, briefId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load submission history</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No submissions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission: Submission) => {
        const status = statusConfig[submission.status as keyof typeof statusConfig];
        const StatusIcon = status?.icon || Clock;

        return (
          <Card key={submission.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    {submission.videoFileName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                    {submission.submissionVersion > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        Version {submission.submissionVersion}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status?.label || submission.status}
                </Badge>
              </div>
            </CardHeader>
            {(submission.message || submission.hasFeedback || onViewSubmission) && (
              <CardContent>
                {submission.message && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {submission.message}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {submission.hasFeedback && (
                    <Badge variant="outline" className="text-xs">
                      Has Feedback
                    </Badge>
                  )}
                  {onViewSubmission && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubmission(submission.id)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}