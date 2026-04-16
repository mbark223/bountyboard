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
import { Checkbox } from "@/components/ui/checkbox";
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
  Send,
  Edit,
  FileText
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
  const url = status ? `/api/admin/influencers?status=${status}` : "/api/admin/influencers";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch influencers");
  const data = await response.json();
  return data.influencers || [];
}

async function updateInfluencerStatus(id: number, status: string, notes?: string) {
  const response = await fetch(`/api/admin/influencers/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ influencerId: id, status, notes }),
  });
  if (!response.ok) throw new Error("Failed to update influencer status");
  return response.json();
}

async function createInvite(email: string, message?: string, sendEmailInvite?: boolean, fromEmail?: string) {
  const response = await fetch("/api/invites/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message, expiresInDays: 7, sendEmailInvite, fromEmail }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create invite");
  }
  return response.json();
}

async function updateInfluencerInfo(id: number, data: any) {
  const response = await fetch("/api/admin/influencers/update-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ influencerId: id, ...data }),
  });
  if (!response.ok) throw new Error("Failed to update influencer info");
  return response.json();
}

async function fetchPublishedBriefs() {
  const response = await fetch("/api/admin/briefs");
  if (!response.ok) throw new Error("Failed to fetch briefs");
  const data = await response.json();
  // API returns array directly, not wrapped in { briefs: [] }
  return Array.isArray(data) ? data : (data.briefs || []);
}

async function assignBriefToTalent(briefId: number, influencerId: number) {
  // Get user email from localStorage
  const storedUser = localStorage.getItem("auth_user");
  const assignedBy = storedUser ? JSON.parse(storedUser).email : "admin";

  const response = await fetch("/api/admin/brief-assignments/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ briefId, influencerId, assignedBy }),
  });
  if (!response.ok) throw new Error("Failed to assign brief");
  return response.json();
}

export default function AdminInfluencers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [assignBriefDialog, setAssignBriefDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendEmailInvite, setSendEmailInvite] = useState(false);
  const [fromEmail, setFromEmail] = useState("");

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editInstagramHandle, setEditInstagramHandle] = useState("");
  const [editInstagramFollowers, setEditInstagramFollowers] = useState("");
  const [editTiktokHandle, setEditTiktokHandle] = useState("");

  // Brief assignment state
  const [selectedBriefId, setSelectedBriefId] = useState<number | null>(null);

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
        description: "Talent status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update talent status.",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, message, sendEmailInvite, fromEmail }: {
      email: string;
      message?: string;
      sendEmailInvite?: boolean;
      fromEmail?: string;
    }) =>
      createInvite(email, message, sendEmailInvite, fromEmail),
    onSuccess: (data) => {
      setInviteDialog(false);
      setInviteEmail("");
      setInviteMessage("");
      setSendEmailInvite(false);
      setFromEmail("");
      toast({
        title: "Invite Created",
        description: data.emailSent
          ? `Invite email sent to ${inviteEmail}`
          : `Invite link: ${data.inviteUrl}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invite.",
        variant: "destructive",
      });
    },
  });

  const { data: briefs = [] } = useQuery({
    queryKey: ["admin-briefs"],
    queryFn: fetchPublishedBriefs,
  });

  const updateInfoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateInfluencerInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      setEditDialog(false);
      toast({
        title: "Updated",
        description: "Talent information updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update talent information.",
        variant: "destructive",
      });
    },
  });

  const assignBriefMutation = useMutation({
    mutationFn: ({ briefId, influencerId }: { briefId: number; influencerId: number }) =>
      assignBriefToTalent(briefId, influencerId),
    onSuccess: () => {
      setAssignBriefDialog(false);
      setSelectedBriefId(null);
      toast({
        title: "Brief Assigned",
        description: "Brief has been assigned to talent successfully.",
      });
    },
    onError: (error: any) => {
      // Don't show error if brief is already assigned
      if (error.message?.includes("already assigned")) {
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to assign brief.",
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
      sendEmailInvite,
      fromEmail: fromEmail || undefined,
    });
  };

  const handleEditClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setEditFirstName(influencer.firstName);
    setEditLastName(influencer.lastName);
    setEditEmail(influencer.email);
    setEditPhone(influencer.phone || "");
    setEditInstagramHandle(influencer.instagramHandle.replace('@', ''));
    setEditInstagramFollowers(influencer.instagramFollowers?.toString() || "");
    setEditTiktokHandle(influencer.tiktokHandle || "");
    setEditDialog(true);
  };

  const handleUpdateInfo = () => {
    if (!selectedInfluencer) return;

    updateInfoMutation.mutate({
      id: selectedInfluencer.id,
      data: {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone || null,
        instagramHandle: editInstagramHandle.startsWith('@') ? editInstagramHandle : `@${editInstagramHandle}`,
        instagramFollowers: editInstagramFollowers ? parseInt(editInstagramFollowers) : null,
        tiktokHandle: editTiktokHandle || null,
      },
    });
  };

  const handleAssignBriefClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setAssignBriefDialog(true);
  };

  const handleAssignBrief = () => {
    if (!selectedInfluencer || !selectedBriefId) return;

    assignBriefMutation.mutate({
      briefId: selectedBriefId,
      influencerId: selectedInfluencer.id,
    });
  };

  const handleAssignAllBriefs = async () => {
    if (!selectedInfluencer || briefs.length === 0) return;

    let successCount = 0;
    let skipCount = 0;

    // Assign all briefs sequentially
    for (const brief of briefs) {
      try {
        await assignBriefToTalent(brief.id, selectedInfluencer.id);
        successCount++;
      } catch (error: any) {
        if (error.message?.includes("already assigned")) {
          skipCount++;
        }
      }
    }

    setAssignBriefDialog(false);
    setSelectedBriefId(null);

    toast({
      title: "Briefs Assigned",
      description: `Assigned ${successCount} brief${successCount !== 1 ? 's' : ''} to ${selectedInfluencer.firstName}${skipCount > 0 ? ` (${skipCount} already assigned)` : ''}`,
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
            <h1 className="text-2xl font-semibold">Talent Management</h1>
            <p className="text-muted-foreground">Review and manage talent applications</p>
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
                  <p className="text-muted-foreground">No {selectedTab === "all" ? "" : selectedTab} talent found</p>
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

                      <div className="flex gap-2 flex-wrap">
                        {influencer.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInfluencer(influencer);
                              setReviewDialog(true);
                            }}
                          >
                            Review Application
                          </Button>
                        )}
                        {influencer.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(influencer)}
                              className="gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit Info
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAssignBriefClick(influencer)}
                              className="gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              Assign Brief
                            </Button>
                          </>
                        )}
                      </div>
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
            <DialogTitle>Send Talent Invite</DialogTitle>
            <DialogDescription>
              Create an invite link for new talent
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
                placeholder="talent@example.com"
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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendEmailInvite"
                checked={sendEmailInvite}
                onCheckedChange={(checked) => setSendEmailInvite(checked as boolean)}
              />
              <Label htmlFor="sendEmailInvite" className="text-sm font-normal cursor-pointer">
                Send invite via email
              </Label>
            </div>
            {sendEmailInvite && (
              <div>
                <Label htmlFor="fromEmail">From Email (Optional)</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="your.email@company.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to use default noreply email
                </p>
              </div>
            )}
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

      {/* Edit Talent Info Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Talent Information</DialogTitle>
            <DialogDescription>
              Update information for {selectedInfluencer?.firstName} {selectedInfluencer?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editFirstName">First Name</Label>
              <Input
                id="editFirstName"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <Label htmlFor="editLastName">Last Name</Label>
              <Input
                id="editLastName"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="editInstagramHandle">Instagram Handle</Label>
              <Input
                id="editInstagramHandle"
                value={editInstagramHandle}
                onChange={(e) => setEditInstagramHandle(e.target.value)}
                placeholder="username"
              />
            </div>
            <div>
              <Label htmlFor="editInstagramFollowers">Instagram Followers</Label>
              <Input
                id="editInstagramFollowers"
                type="number"
                value={editInstagramFollowers}
                onChange={(e) => setEditInstagramFollowers(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="editTiktokHandle">TikTok Handle (Optional)</Label>
              <Input
                id="editTiktokHandle"
                value={editTiktokHandle}
                onChange={(e) => setEditTiktokHandle(e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInfo}
              disabled={updateInfoMutation.isPending || !editFirstName || !editLastName || !editEmail || !editInstagramHandle}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Brief Dialog */}
      <Dialog open={assignBriefDialog} onOpenChange={setAssignBriefDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Brief to Talent</DialogTitle>
            <DialogDescription>
              Select a brief to assign to {selectedInfluencer?.firstName} {selectedInfluencer?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Brief</Label>
                {briefs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAssignAllBriefs}
                    disabled={assignBriefMutation.isPending}
                  >
                    Assign All ({briefs.length})
                  </Button>
                )}
              </div>
              <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto">
                {briefs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published briefs available</p>
                ) : (
                  briefs.map((brief: any) => (
                    <Card
                      key={brief.id}
                      className={`cursor-pointer transition-all ${
                        selectedBriefId === brief.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedBriefId(brief.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedBriefId === brief.id}
                            onCheckedChange={() => setSelectedBriefId(brief.id)}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{brief.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {brief.orgName} • {brief.businessLine} • {brief.state}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {brief.rewardType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Due {new Date(brief.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignBriefDialog(false);
              setSelectedBriefId(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignBrief}
              disabled={!selectedBriefId || assignBriefMutation.isPending}
            >
              Assign Brief
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}