import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  DollarSign,
  Video,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Briefcase,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Brief {
  id: number;
  title: string;
  slug: string;
  overview: string;
  deadline: string;
  rewardType: string;
  rewardAmount: string;
  rewardCurrency: string;
  rewardDescription?: string;
  maxSubmissionsPerCreator: number;
  organization: {
    name: string;
  };
}

async function fetchAssignedBriefs() {
  const response = await fetch("/api/briefs", {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch assigned briefs");
  }

  return response.json();
}

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: briefs, isLoading, error } = useQuery<Brief[]>({
    queryKey: ["assigned-briefs"],
    queryFn: fetchAssignedBriefs,
  });

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatReward = (brief: Brief) => {
    if (brief.rewardType === "CASH") {
      return `$${brief.rewardAmount} ${brief.rewardCurrency}`;
    } else if (brief.rewardType === "BONUS_BETS") {
      return `$${brief.rewardAmount} ${brief.rewardDescription || "in Bonus Bets"}`;
    } else {
      return brief.rewardDescription || brief.rewardAmount;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-white mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-slate-400">
            View your assigned briefs and submit your content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Assigned Briefs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  briefs?.length || 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  briefs?.filter(b => !isDeadlinePassed(b.deadline)).length || 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Track coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && briefs?.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Assigned Briefs Yet
              </h3>
              <p className="text-slate-400">
                You haven't been assigned to any briefs. Check back soon or contact your
                account manager.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Briefs Grid */}
        {!isLoading && briefs && briefs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {briefs.map((brief) => {
              const deadlinePassed = isDeadlinePassed(brief.deadline);
              const deadlineText = deadlinePassed
                ? "Deadline passed"
                : `Due ${formatDistanceToNow(new Date(brief.deadline), { addSuffix: true })}`;

              return (
                <Card
                  key={brief.id}
                  className={`bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-all cursor-pointer ${
                    deadlinePassed ? "opacity-60" : ""
                  }`}
                  onClick={() => setLocation(`/briefs/${brief.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={deadlinePassed ? "secondary" : "default"}
                        className="mb-2"
                      >
                        {brief.organization.name}
                      </Badge>
                      {deadlinePassed && (
                        <Badge variant="destructive">Closed</Badge>
                      )}
                    </div>
                    <CardTitle className="text-white">{brief.title}</CardTitle>
                    <CardDescription className="text-slate-400 line-clamp-2">
                      {brief.overview}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Reward */}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-slate-300 font-semibold">
                          {formatReward(brief)}
                        </span>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar
                          className={`h-4 w-4 ${
                            deadlinePassed ? "text-red-500" : "text-yellow-500"
                          }`}
                        />
                        <span
                          className={
                            deadlinePassed ? "text-red-400" : "text-slate-400"
                          }
                        >
                          {deadlineText}
                        </span>
                      </div>

                      {/* Submissions Allowed */}
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-400">
                          Up to {brief.maxSubmissionsPerCreator} submission
                          {brief.maxSubmissionsPerCreator > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full mt-4"
                        variant={deadlinePassed ? "secondary" : "default"}
                        disabled={deadlinePassed}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(
                            deadlinePassed
                              ? `/briefs/${brief.id}`
                              : `/briefs/${brief.id}/submit`
                          );
                        }}
                      >
                        {deadlinePassed ? "View Details" : "Submit Video"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
