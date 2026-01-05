import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Play, Check, X, DollarSign, Calendar, Users, MessageSquare, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FeedbackSection } from "@/components/FeedbackSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSubmissionStatus, createFeedback, fetchBriefById, fetchSubmissions } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Brief, Submission } from "@shared/schema";
import { Spinner } from "@/components/ui/spinner";

export default function AdminBriefDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [allowResubmission, setAllowResubmission] = useState(true);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'selected' | 'rejected' | 'pending'>('all');

  // Fetch brief data
  const { data: brief, isLoading: briefLoading } = useQuery({
    queryKey: ["brief", id],
    queryFn: () => fetchBriefById(id || ""),
    enabled: !!id,
  });

  // Fetch submissions
  const { data: submissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery({
    queryKey: ["submissions", id],
    queryFn: () => fetchSubmissions(parseInt(id || "0")),
    enabled: !!id,
  });
  
  // Debug logging
  console.log('[AdminBriefDetail] Brief ID:', id);
  console.log('[AdminBriefDetail] Submissions:', submissions);
  console.log('[AdminBriefDetail] Submissions loading:', submissionsLoading);

  // Mutation for updating submission status
  const statusMutation = useMutation({
    mutationFn: async ({ submissionId, status, reviewNotes, allowsResubmission }: {
      submissionId: number;
      status: string;
      reviewNotes?: string;
      allowsResubmission?: boolean;
    }) => {
      return updateSubmissionStatus(submissionId, status, allowsResubmission, reviewNotes);
    },
    onSuccess: (data) => {
      // Refresh submissions list
      refetchSubmissions();
      // Ensure data has the correct structure before setting
      if (data && typeof data.id === 'number') {
        setSelectedSubmission(data);
      }
      setShowRejectionDialog(false);
      setRejectionFeedback("");
      
      toast({
        title: "Status Updated",
        description: `Submission marked as ${data.status}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating feedback
  const feedbackMutation = useMutation({
    mutationFn: async ({ submissionId, comment }: {
      submissionId: number;
      comment: string;
    }) => {
      return createFeedback(submissionId, comment, true); // requiresAction = true for rejections
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", selectedSubmission?.id] });
    }
  });

  const handleStatusChange = (status: Submission['status']) => {
    if (!selectedSubmission) return;
    
    if (status === 'NOT_SELECTED') {
      // Show rejection dialog
      setShowRejectionDialog(true);
    } else {
      // Direct status update for selection
      statusMutation.mutate({
        submissionId: selectedSubmission.id,
        status
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionFeedback.trim()) return;

    const submissionId = selectedSubmission.id;

    // Update status with review notes
    await statusMutation.mutateAsync({
      submissionId,
      status: 'NOT_SELECTED',
      reviewNotes: rejectionFeedback,
      allowsResubmission: allowResubmission
    });

    // Also create a feedback entry
    if (rejectionFeedback.trim()) {
      await feedbackMutation.mutateAsync({
        submissionId,
        comment: `Rejection reason: ${rejectionFeedback}`
      });
    }
  };

  if (briefLoading || submissionsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (!brief) return <AdminLayout><div>Brief not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button variant="ghost" className="pl-0 mb-4 hover:bg-transparent hover:text-primary" onClick={() => setLocation('/admin/briefs')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Briefs
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-bold tracking-tight">{brief.title}</h1>
              <Badge variant="outline" className={brief.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                {brief.status}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{brief.overview}</p>
          </div>
          
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => window.open(`/b/${brief.slug}`, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Public Page
            </Button>
            <Button onClick={() => {
              console.log('Edit button clicked, navigating to:', `/admin/briefs/${id}/edit`);
              setLocation(`/admin/briefs/${id}/edit`);
            }}>Edit Brief</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bounty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {brief.reward.type === 'OTHER' ? <Users className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
              {brief.reward.type === 'OTHER' ? brief.reward.amount : formatCurrency(brief.reward.amount as number)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {new Date(brief.deadline).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              {brief.submissionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="details">Brief Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Received Submissions</CardTitle>
                  <CardDescription>Review and select winners for the bounty.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={statusFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({submissions.length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending ({submissions.filter(s => s.status === 'RECEIVED' || s.status === 'IN_REVIEW').length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'selected' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('selected')}
                  >
                    Selected ({submissions.filter(s => s.status === 'SELECTED').length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setStatusFilter('rejected')}
                  >
                    Rejected ({submissions.filter(s => s.status === 'NOT_SELECTED').length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions
                    .filter((sub) => {
                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'pending') return sub.status === 'RECEIVED' || sub.status === 'IN_REVIEW';
                      if (statusFilter === 'selected') return sub.status === 'SELECTED';
                      if (statusFilter === 'rejected') return sub.status === 'NOT_SELECTED';
                      return true;
                    })
                    .map((sub) => (
                    <TableRow key={sub.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{sub.creator.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.creator.handle}</div>
                      </TableCell>
                      <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                          <Play className="h-3 w-3" />
                          Watch ({sub.video.duration})
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={
                            sub.status === 'SELECTED' ? 'bg-green-100 text-green-700 border-green-200' :
                            sub.status === 'NOT_SELECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {sub.status.replace('_', ' ')}
                          </Badge>
                          {sub.status === 'NOT_SELECTED' && sub.reviewNotes && (
                            <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                              <p className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-medium">Rejection reason:</span> {sub.reviewNotes}
                              </p>
                              {sub.allowsResubmission && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  Resubmission allowed
                                </p>
                              )}
                            </div>
                          )}
                          {sub.hasFeedback > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {sub.hasFeedback} Feedback
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setShowReviewDialog(true);
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.filter((sub) => {
                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'pending') return sub.status === 'RECEIVED' || sub.status === 'IN_REVIEW';
                      if (statusFilter === 'selected') return sub.status === 'SELECTED';
                      if (statusFilter === 'rejected') return sub.status === 'NOT_SELECTED';
                      return true;
                    }).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {submissions.length === 0 
                          ? "No submissions yet." 
                          : `No ${statusFilter === 'pending' ? 'pending' : statusFilter} submissions found.`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
             <CardHeader>
              <CardTitle>Brief Requirements</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="prose dark:prose-invert">
                 <h3>Overview</h3>
                 <p>{brief.overview}</p>
                 <h3>Requirements</h3>
                 <ul>
                   {brief.requirements.map((r, i) => <li key={i}>{r}</li>)}
                 </ul>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Video Area */}
            <div className="bg-black flex-1 flex items-center justify-center p-4">
              {/* Mock Video Player */}
              <div className="aspect-[9/16] h-full max-h-[70vh] bg-zinc-900 rounded-lg flex items-center justify-center text-white border border-zinc-800 relative group">
                <img src={selectedSubmission?.video?.thumbnail || '/placeholder-video.jpg'} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <Play className="h-16 w-16 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </div>
            
            {/* Controls Area */}
            <div className="w-full md:w-96 bg-card border-l p-6 flex flex-col overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review Submission</DialogTitle>
                <DialogDescription>
                  Review the video submission and provide feedback to the creator
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6 flex-1">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Creator</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {selectedSubmission?.creator?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{selectedSubmission?.creator?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission?.creator?.handle || '@unknown'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground italic">"Here is my submission! I really focused on the lighting as requested. Hope you like it!"</p>
                </div>

                {/* Display rejection reason if exists */}
                {selectedSubmission?.status === 'NOT_SELECTED' && selectedSubmission?.reviewNotes && (
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Rejection Feedback</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{selectedSubmission.reviewNotes}</p>
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Review Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={selectedSubmission?.status === 'SELECTED' ? 'default' : 'outline'}
                      className={selectedSubmission?.status === 'SELECTED' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleStatusChange('SELECTED')}
                      disabled={!selectedSubmission}
                    >
                      <Check className="mr-2 h-4 w-4" /> Select
                    </Button>
                    <Button 
                      variant={selectedSubmission?.status === 'NOT_SELECTED' ? 'destructive' : 'outline'}
                      onClick={() => handleStatusChange('NOT_SELECTED')}
                      disabled={!selectedSubmission}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                  {/* Show resubmission option when rejecting */}
                  {selectedSubmission?.status !== 'SELECTED' && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Checkbox 
                        id="allow-resubmit"
                        checked={allowResubmission}
                        onCheckedChange={(checked) => setAllowResubmission(!!checked)}
                      />
                      <Label 
                        htmlFor="allow-resubmit" 
                        className="text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Allow creator to resubmit
                      </Label>
                    </div>
                  )}
                </div>

                {selectedSubmission?.status === 'SELECTED' && brief && (
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 border-green-200">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Bounty Eligible</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                      This submission is now eligible for the <strong>{formatCurrency(brief.reward.amount as number)}</strong> bounty.
                    </p>
                    <Button size="sm" variant="outline" className="w-full bg-white dark:bg-black">
                      Mark as Paid
                    </Button>
                  </div>
                )}
                
                {/* Feedback Section */}
                {selectedSubmission && (
                  <div className="border-t pt-4">
                    <FeedbackSection submissionId={selectedSubmission.id} />
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 pt-4 border-t">
                <Button variant="ghost" onClick={() => {
                  setSelectedSubmission(null);
                  setShowReviewDialog(false);
                }}>Close</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Provide feedback to help the creator understand why their submission was rejected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-feedback">Rejection Feedback</Label>
              <Textarea
                id="rejection-feedback"
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="Explain why this submission doesn't meet the requirements..."
                className="min-h-[120px] mt-2"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This feedback will be visible to the creator and saved in the feedback section.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-resubmit-dialog"
                checked={allowResubmission}
                onCheckedChange={(checked) => setAllowResubmission(!!checked)}
              />
              <Label
                htmlFor="allow-resubmit-dialog"
                className="text-sm flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Allow creator to resubmit
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionFeedback.trim() || statusMutation.isPending}
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
