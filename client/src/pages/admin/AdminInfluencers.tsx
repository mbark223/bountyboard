import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Instagram,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Shield,
  Youtube,
  Hash,
  AlertCircle,
  Send
} from "lucide-react";

interface Influencer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  instagramHandle: string;
  instagramFollowers?: number;
  instagramVerified: number;
  tiktokHandle?: string;
  youtubeChannel?: string;
  bankAccountHolderName?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  idVerified: number;
  bankVerified: number;
  adminNotes?: string;
  rejectionReason?: string;
  appliedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

async function fetchInfluencers(status?: string): Promise<Influencer[]> {
  const url = status ? `/api/influencers?status=${status}` : "/api/influencers";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch influencers");
  return response.json();
}

async function updateInfluencerStatus(id: number, status: string, notes?: string) {
  const response = await fetch(`/api/influencers/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });
  if (!response.ok) throw new Error("Failed to update influencer status");
  return response.json();
}

async function createInvite(email: string, message?: string) {
  const response = await fetch("/api/invites/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message, expiresInDays: 7 }),
  });
  if (!response.ok) throw new Error("Failed to create invite");
  return response.json();
}

export default function AdminInfluencers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const { data: influencers = [], isLoading } = useQuery({
    queryKey: ["influencers", selectedTab],
    queryFn: () => fetchInfluencers(selectedTab === "all" ? undefined : selectedTab),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      updateInfluencerStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      setReviewDialog(false);
      setSelectedInfluencer(null);
      setReviewNotes("");
      toast({
        title: "Status Updated",
        description: "Influencer status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update influencer status.",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, message }: { email: string; message?: string }) =>
      createInvite(email, message),
    onSuccess: (data) => {
      setInviteDialog(false);
      setInviteEmail("");
      setInviteMessage("");
      toast({
        title: "Invite Created",
        description: `Invite link: ${data.inviteUrl}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invite.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (status: "approved" | "rejected") => {
    if (!selectedInfluencer) return;
    
    statusMutation.mutate({
      id: selectedInfluencer.id,
      status,
      notes: reviewNotes,
    });
  };

  const handleCreateInvite = () => {
    inviteMutation.mutate({
      email: inviteEmail,
      message: inviteMessage,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Suspended</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Influencer Management</h1>
            <p className="text-muted-foreground">Review and manage influencer applications</p>
          </div>
          <Button onClick={() => setInviteDialog(true)} className="gap-2">
            <Send className="h-4 w-4" />
            Send Invite
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : influencers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No {selectedTab === "all" ? "" : selectedTab} influencers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {influencers.map((influencer) => (
                  <Card key={influencer.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {influencer.firstName} {influencer.lastName}
                          </CardTitle>
                          <CardDescription>
                            Applied {formatDistanceToNow(new Date(influencer.appliedAt), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(influencer.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{influencer.email}</span>
                          </div>
                          {influencer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{influencer.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                            <span>@{influencer.instagramHandle}</span>
                            {influencer.instagramFollowers && (
                              <Badge variant="outline" className="text-xs">
                                {influencer.instagramFollowers.toLocaleString()} followers
                              </Badge>
                            )}
                          </div>
                          {influencer.tiktokHandle && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">TT</span>
                              <span>@{influencer.tiktokHandle}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          {influencer.idVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">ID Verified</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {influencer.bankVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">Bank Verified</span>
                        </div>
                      </div>

                      {influencer.adminNotes && (
                        <div className="p-3 bg-muted rounded-md mb-4">
                          <p className="text-sm font-medium mb-1">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{influencer.adminNotes}</p>
                        </div>
                      )}

                      {influencer.rejectionReason && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md mb-4">
                          <p className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">Rejection Reason:</p>
                          <p className="text-sm text-red-600 dark:text-red-300">{influencer.rejectionReason}</p>
                        </div>
                      )}

                      {influencer.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInfluencer(influencer);
                              setReviewDialog(true);
                            }}
                          >
                            Review Application
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review {selectedInfluencer?.firstName} {selectedInfluencer?.lastName}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("rejected")}
              disabled={statusMutation.isPending}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleStatusUpdate("approved")}
              disabled={statusMutation.isPending}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Influencer Invite</DialogTitle>
            <DialogDescription>
              Create an invite link for a new influencer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="influencer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
              <Textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="We'd love to have you join our creator network..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateInvite}
              disabled={!inviteEmail || inviteMutation.isPending}
            >
              Create Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}