import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { VideoUploader } from "@/components/VideoUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowLeft, Loader2, AlertCircle, FileText, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  message: z.string().optional(),
});

interface InfluencerData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  instagramHandle: string;
  phone: string | null;
}

interface BriefDetails {
  id: number;
  title: string;
  orgName: string;
  overview: string;
  requirements: string[];
  deliverableRatio: string;
  deliverableLength: string;
  deliverableFormat: string;
  rewardType: string;
  rewardAmount: string;
  deadline: string;
  maxSubmissionsPerCreator: number;
}

async function fetchInfluencerData(email: string): Promise<InfluencerData> {
  const response = await fetch(`/api/influencers/portal?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch influencer data");
  }
  const data = await response.json();
  return data.influencer;
}

async function fetchBriefDetails(briefId: string): Promise<BriefDetails> {
  const response = await fetch(`/api/briefs/${briefId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch brief details");
  }
  return response.json();
}

async function createSubmission(data: {
  briefId: number;
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string | null;
  creatorHandle: string;
  message?: string;
  videoUrl: string;
  videoFileName: string;
  videoMimeType: string;
  videoSizeBytes: number;
}) {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create submission");
  }

  return response.json();
}

export default function InfluencerSubmissionPage() {
  const { briefId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [videoData, setVideoData] = useState<{
    url: string;
    key: string;
    file: File;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  // Fetch influencer data
  const { data: influencer, isLoading: loadingInfluencer } = useQuery({
    queryKey: ["influencer", user?.email],
    queryFn: () => fetchInfluencerData(user?.email || ""),
    enabled: !!user?.email,
  });

  // Fetch brief details
  const { data: brief, isLoading: loadingBrief } = useQuery({
    queryKey: ["brief", briefId],
    queryFn: () => fetchBriefDetails(briefId!),
    enabled: !!briefId,
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      setIsSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVideoUploaded = (videoUrl: string, videoKey: string, file: File) => {
    setVideoData({ url: videoUrl, key: videoKey, file });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!videoData || !influencer || !brief) return;

    submitMutation.mutate({
      briefId: brief.id,
      creatorName: `${influencer.firstName} ${influencer.lastName}`,
      creatorEmail: influencer.email,
      creatorPhone: influencer.phone,
      creatorHandle: influencer.instagramHandle,
      message: data.message,
      videoUrl: videoData.url,
      videoFileName: videoData.file.name,
      videoMimeType: videoData.file.type,
      videoSizeBytes: videoData.file.size,
    });
  };

  if (!user) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto py-16">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to submit videos.
            </AlertDescription>
          </Alert>
        </div>
      </PublicLayout>
    );
  }

  if (loadingInfluencer || loadingBrief) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!influencer || !brief) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto py-16">
          <Alert variant="destructive">
            <AlertDescription>
              Unable to load submission page. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </PublicLayout>
    );
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your video has been submitted for review.
            </p>
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <ol className="text-left space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </span>
                    <span>Your submission will be reviewed by the {brief.orgName} team</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <span>You'll receive an email notification about your submission status</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <span>If selected, payment will be processed according to the brief terms</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setLocation("/portal")}>
                Back to Portal
              </Button>
              <Button onClick={() => setLocation("/")}>
                Browse More Briefs
              </Button>
            </div>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  const rewardDisplay = brief.rewardType === "CASH" 
    ? formatCurrency(parseFloat(brief.rewardAmount))
    : brief.rewardType === "BONUS_BETS"
    ? `${formatCurrency(parseFloat(brief.rewardAmount))} in Bonus Bets`
    : brief.rewardAmount;

  return (
    <PublicLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/portal")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portal
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Brief Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{brief.title}</CardTitle>
                <CardDescription>{brief.orgName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Reward</span>
                  </div>
                  <p className="font-semibold">{rewardDisplay}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline</span>
                  </div>
                  <p className="font-semibold">
                    {format(new Date(brief.deadline), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    <span>Requirements</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {brief.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Submit Your Video</h1>
              <p className="text-muted-foreground">
                Upload your video submission for this brief
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label>Video Upload *</Label>
                    <VideoUploader
                      onVideoUploaded={handleVideoUploaded}
                      briefId={brief.id}
                      creatorEmail={influencer.email}
                    />
                  </div>

                  {/* Optional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      {...form.register("message")}
                      placeholder="Any additional notes or context for your submission..."
                      rows={4}
                    />
                  </div>

                  {/* Submission Info */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Submitting as:</strong> {influencer.firstName} {influencer.lastName} ({influencer.instagramHandle})
                    </AlertDescription>
                  </Alert>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!videoData || submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Video"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}