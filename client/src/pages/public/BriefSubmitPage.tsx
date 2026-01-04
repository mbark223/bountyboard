import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { fetchBriefBySlug } from "@/lib/api";
import { transformBrief } from "@/lib/transformers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileVideo, X, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  handle: z.string().min(2, "Instagram handle is required"),
  bettingAccount: z.string().optional(),
  notes: z.string().optional(),
  agreeRights: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

export default function BriefSubmitPage() {
  const { slug } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch brief data
  const { data: rawBrief, isLoading: briefLoading, error: briefError } = useQuery({
    queryKey: ["brief", slug],
    queryFn: () => fetchBriefBySlug(slug!),
    enabled: !!slug,
  });

  const brief = rawBrief ? transformBrief(rawBrief) : null;
  
  // Check if this is a resubmission
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const resubmitId = searchParams.get('resubmit');
  const isResubmission = !!resubmitId;

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      handle: "",
      bettingAccount: "",
      notes: "",
      agreeRights: false,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!file) {
      toast({
        title: "Video required",
        description: "Please upload a video file to submit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo(0, 0);
  };

  if (briefLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PublicLayout>
    );
  }

  if (briefError || !brief) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Brief Not Found</h1>
          <p className="text-muted-foreground mb-8">The brief you are looking for does not exist or has been archived.</p>
          <Button onClick={() => setLocation("/briefs")} variant="outline">
            View All Briefs
          </Button>
        </div>
      </PublicLayout>
    );
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-100 dark:bg-green-900/20 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>
          <h1 className="text-3xl font-heading font-bold mb-4">Submission Received!</h1>
          <p className="text-muted-foreground mb-8">
            Thanks for submitting to <strong>{brief.title}</strong>. The {brief.orgName} team will review your video shortly. You'll receive a confirmation email at {form.getValues().email}.
          </p>
          <Button onClick={() => setLocation(`/b/${brief.slug}`)} variant="outline">
            Back to Brief
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => setLocation(`/b/${brief.slug}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Brief
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            {isResubmission ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-8 w-8" />
                Resubmit Video
              </span>
            ) : (
              "Submit Video"
            )}
          </h1>
          <p className="text-muted-foreground">
            For: <span className="font-medium text-foreground">{brief.title}</span>
          </p>
        </div>

        {isResubmission && (
          <Alert className="mb-6">
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              You're submitting a new version of your video. Please make sure to address the feedback from your previous submission.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Creator Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Info</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" {...form.register("name")} placeholder="Jane Doe" data-testid="input-name" />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...form.register("email")} placeholder="jane@example.com" data-testid="input-email" />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" {...form.register("phone")} placeholder="(555) 123-4567" data-testid="input-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="handle">Instagram Handle *</Label>
                    <Input id="handle" {...form.register("handle")} placeholder="@username" data-testid="input-handle" />
                    {form.formState.errors.handle && (
                      <p className="text-sm text-destructive">{form.formState.errors.handle.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bettingAccount">Hard Rock Bet Account Username</Label>
                  <Input id="bettingAccount" {...form.register("bettingAccount")} placeholder="Your HRB username (for bonus bet rewards)" data-testid="input-betting-account" />
                  <p className="text-xs text-muted-foreground">Required if you're receiving bonus bet rewards</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Video Upload</h3>
                
                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={`
                      border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-lg mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">MP4, MOV or AVI (Max 500MB)</p>
                  </div>
                ) : (
                  <div className="bg-muted/30 border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileVideo className="h-5 w-5 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0); }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Reviewer (Optional)</Label>
                <Textarea 
                  id="notes" 
                  {...form.register("notes")} 
                  placeholder="Anything else we should know?"
                  className="resize-none h-24"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox 
                  id="agreeRights" 
                  checked={form.watch("agreeRights")}
                  onCheckedChange={(c) => form.setValue("agreeRights", c as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="agreeRights" 
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    I confirm that I own the rights to this video and grant {brief.orgName} permission to review this submission. I understand that selection for the bounty is at the sole discretion of the brand.
                  </Label>
                  {form.formState.errors.agreeRights && (
                    <p className="text-sm text-destructive">{form.formState.errors.agreeRights.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg" 
                disabled={isSubmitting || !file || uploadProgress < 100}
              >
                {isSubmitting ? "Submitting..." : "Submit Video"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
