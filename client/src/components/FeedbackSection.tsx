import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MessageSquare, AlertCircle, Clock, Trash2 } from "lucide-react";
import { fetchFeedback, createFeedback, deleteFeedback } from "@/lib/api";
import type { Feedback } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FeedbackSectionProps {
  submissionId: number;
}

export function FeedbackSection({ submissionId }: FeedbackSectionProps) {
  const [comment, setComment] = useState("");
  const [requiresAction, setRequiresAction] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ["feedback", submissionId],
    queryFn: () => fetchFeedback(submissionId),
  });

  // Create feedback mutation
  const createMutation = useMutation({
    mutationFn: () => createFeedback(submissionId, comment, requiresAction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", submissionId] });
      setComment("");
      setRequiresAction(false);
      toast({
        title: "Feedback added",
        description: "Your feedback has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: (feedbackId: number) => deleteFeedback(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", submissionId] });
      toast({
        title: "Feedback deleted",
        description: "The feedback has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </h4>
        
        {/* Add feedback form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add feedback for the creator..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires-action"
                checked={requiresAction}
                onCheckedChange={(checked) => setRequiresAction(!!checked)}
              />
              <Label htmlFor="requires-action" className="text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Requires Action
              </Label>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              disabled={!comment.trim() || createMutation.isPending}
            >
              Add Feedback
            </Button>
          </div>
        </form>
      </div>

      {/* Feedback list */}
      <div className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading feedback...</p>
        )}
        {feedbackList.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground italic">No feedback yet.</p>
        )}
        {feedbackList.map((feedback: Feedback) => (
          <Card key={feedback.id} className={feedback.requiresAction ? "border-orange-200 bg-orange-50 dark:bg-orange-900/10" : ""}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{feedback.authorName}</span>
                    {feedback.requiresAction === 1 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Action Required
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(feedback.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm">{feedback.comment}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => deleteMutation.mutate(feedback.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}