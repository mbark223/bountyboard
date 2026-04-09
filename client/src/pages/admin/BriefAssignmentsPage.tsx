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

interface Talent {
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
  talentId: number;
  assignedAt: string;
  talent: Talent;
}

async function fetchApprovedTalents() {
  const response = await fetch("/api/talents?status=approved", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch talents");
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

async function assignTalent(briefId: number, talentId: number) {
  const response = await fetch("/api/admin/brief-assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ briefId, talentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to assign talent");
  }

  return response.json();
}

async function removeAssignment(briefId: number, talentId: number) {
  const response = await fetch("/api/admin/brief-assignments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ briefId, talentId }),
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

  const { data: talents, isLoading: loadingTalents } = useQuery<Talent[]>({
    queryKey: ["approved-talents"],
    queryFn: fetchApprovedTalents,
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["brief-assignments", briefId],
    queryFn: () => fetchAssignments(briefId),
  });

  const assignMutation = useMutation({
    mutationFn: ({ talentId }: { talentId: number }) =>
      assignTalent(parseInt(briefId), talentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief-assignments", briefId] });
      toast({
        title: "Success",
        description: "Talent assigned successfully",
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
    mutationFn: ({ talentId }: { talentId: number }) =>
      removeAssignment(parseInt(briefId), talentId),
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

  const isAssigned = (talentId: number) => {
    return assignments?.some((a) => a.talentId === talentId);
  };

  const toggleAssignment = (talentId: number) => {
    if (isAssigned(talentId)) {
      removeMutation.mutate({ talentId });
    } else {
      assignMutation.mutate({ talentId });
    }
  };

  const filteredTalents = talents?.filter((inf) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inf.firstName.toLowerCase().includes(searchLower) ||
      inf.lastName.toLowerCase().includes(searchLower) ||
      inf.email.toLowerCase().includes(searchLower) ||
      inf.instagramHandle.toLowerCase().includes(searchLower)
    );
  });

  const assignedCount = assignments?.length || 0;
  const totalTalents = talents?.length || 0;

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
            Assign talents who can view and submit to this brief
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Assigned Talents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Available Talents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTalents}</div>
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
                {totalTalents > 0
                  ? Math.round((assignedCount / totalTalents) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Talents</CardTitle>
            <CardDescription>Find talents by name, email, or Instagram handle</CardDescription>
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
        {(loadingTalents || loadingAssignments) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Talents List */}
        {!loadingTalents && !loadingAssignments && filteredTalents && (
          <Card>
            <CardHeader>
              <CardTitle>Talents</CardTitle>
              <CardDescription>
                {filteredTalents.length} talent{filteredTalents.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTalents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  No talents found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTalents.map((talent) => {
                    const assigned = isAssigned(talent.id);
                    const isProcessing =
                      assignMutation.isPending || removeMutation.isPending;

                    return (
                      <div
                        key={talent.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={assigned}
                            onCheckedChange={() => toggleAssignment(talent.id)}
                            disabled={isProcessing}
                          />
                          <div>
                            <div className="font-semibold">
                              {talent.firstName} {talent.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {talent.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Instagram className="h-3 w-3 text-pink-500" />
                              <span className="text-xs text-muted-foreground">
                                {talent.instagramHandle}
                              </span>
                              {talent.instagramFollowers && (
                                <span className="text-xs text-muted-foreground">
                                  • {talent.instagramFollowers.toLocaleString()} followers
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
                            onClick={() => toggleAssignment(talent.id)}
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
