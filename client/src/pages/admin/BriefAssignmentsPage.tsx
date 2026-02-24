import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  UserMinus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Instagram,
  ArrowLeft
} from "lucide-react";

interface Influencer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  instagramHandle: string;
  instagramFollowers?: number;
  status: string;
}

interface Assignment {
  id: number;
  briefId: number;
  influencerId: number;
  assignedAt: string;
  influencer: Influencer;
}

async function fetchApprovedInfluencers() {
  const response = await fetch("/api/influencers?status=approved", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch influencers");
  }

  return response.json();
}

async function fetchAssignments(briefId: string) {
  const response = await fetch(`/api/admin/brief-assignments?briefId=${briefId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch assignments");
  }

  return response.json();
}

async function assignInfluencer(briefId: number, influencerId: number) {
  const response = await fetch("/api/admin/brief-assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ briefId, influencerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to assign influencer");
  }

  return response.json();
}

async function removeAssignment(briefId: number, influencerId: number) {
  const response = await fetch("/api/admin/brief-assignments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ briefId, influencerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove assignment");
  }

  return response.json();
}

export default function BriefAssignmentsPage() {
  const params = useParams();
  const briefId = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: influencers, isLoading: loadingInfluencers } = useQuery<Influencer[]>({
    queryKey: ["approved-influencers"],
    queryFn: fetchApprovedInfluencers,
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["brief-assignments", briefId],
    queryFn: () => fetchAssignments(briefId),
  });

  const assignMutation = useMutation({
    mutationFn: ({ influencerId }: { influencerId: number }) =>
      assignInfluencer(parseInt(briefId), influencerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief-assignments", briefId] });
      toast({
        title: "Success",
        description: "Influencer assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ influencerId }: { influencerId: number }) =>
      removeAssignment(parseInt(briefId), influencerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief-assignments", briefId] });
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isAssigned = (influencerId: number) => {
    return assignments?.some((a) => a.influencerId === influencerId);
  };

  const toggleAssignment = (influencerId: number) => {
    if (isAssigned(influencerId)) {
      removeMutation.mutate({ influencerId });
    } else {
      assignMutation.mutate({ influencerId });
    }
  };

  const filteredInfluencers = influencers?.filter((inf) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inf.firstName.toLowerCase().includes(searchLower) ||
      inf.lastName.toLowerCase().includes(searchLower) ||
      inf.email.toLowerCase().includes(searchLower) ||
      inf.instagramHandle.toLowerCase().includes(searchLower)
    );
  });

  const assignedCount = assignments?.length || 0;
  const totalInfluencers = influencers?.length || 0;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/admin/briefs/${briefId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brief
          </Button>
          <h1 className="text-3xl font-heading font-bold mb-2">Manage Assignments</h1>
          <p className="text-muted-foreground">
            Assign influencers who can view and submit to this brief
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Assigned Influencers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Available Influencers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInfluencers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Assignment Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalInfluencers > 0
                  ? Math.round((assignedCount / totalInfluencers) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Influencers</CardTitle>
            <CardDescription>Find influencers by name, email, or Instagram handle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(loadingInfluencers || loadingAssignments) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Influencers List */}
        {!loadingInfluencers && !loadingAssignments && filteredInfluencers && (
          <Card>
            <CardHeader>
              <CardTitle>Influencers</CardTitle>
              <CardDescription>
                {filteredInfluencers.length} influencer{filteredInfluencers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInfluencers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  No influencers found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInfluencers.map((influencer) => {
                    const assigned = isAssigned(influencer.id);
                    const isProcessing =
                      assignMutation.isPending || removeMutation.isPending;

                    return (
                      <div
                        key={influencer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={assigned}
                            onCheckedChange={() => toggleAssignment(influencer.id)}
                            disabled={isProcessing}
                          />
                          <div>
                            <div className="font-semibold">
                              {influencer.firstName} {influencer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {influencer.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Instagram className="h-3 w-3 text-pink-500" />
                              <span className="text-xs text-muted-foreground">
                                {influencer.instagramHandle}
                              </span>
                              {influencer.instagramFollowers && (
                                <span className="text-xs text-muted-foreground">
                                  • {influencer.instagramFollowers.toLocaleString()} followers
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {assigned ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Assigned</Badge>
                          )}
                          <Button
                            size="sm"
                            variant={assigned ? "destructive" : "default"}
                            onClick={() => toggleAssignment(influencer.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : assigned ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-1" />
                                Remove
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Assign
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
