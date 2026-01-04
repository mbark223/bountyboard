import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchBriefById } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function EditBriefPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    requirements: [""],
    deliverableRatio: "",
    deliverableLength: "",
    deliverableFormat: "INSTAGRAM_REELS",
    rewardType: "CASH",
    rewardAmount: "",
    rewardDescription: "",
    deadline: "",
    maxWinners: 1,
    maxSubmissionsPerCreator: 3,
    businessLine: "",
    state: "",
    status: "PUBLISHED"
  });

  // Fetch brief data
  const { data: brief, isLoading } = useQuery({
    queryKey: ["brief", id],
    queryFn: () => fetchBriefById(id || ""),
    enabled: !!id,
  });

  // Update form data when brief loads
  useEffect(() => {
    if (brief) {
      setFormData({
        title: brief.title || "",
        overview: brief.overview || "",
        requirements: brief.requirements?.length > 0 ? brief.requirements : [""],
        deliverableRatio: brief.deliverableRatio || "",
        deliverableLength: brief.deliverableLength || "",
        deliverableFormat: brief.deliverableFormat || "INSTAGRAM_REELS",
        rewardType: brief.reward?.type || "CASH",
        rewardAmount: brief.reward?.amount?.toString() || "",
        rewardDescription: brief.reward?.description || "",
        deadline: brief.deadline ? new Date(brief.deadline).toISOString().split('T')[0] : "",
        maxWinners: brief.maxWinners || 1,
        maxSubmissionsPerCreator: brief.maxSubmissionsPerCreator || 3,
        businessLine: brief.businessLine || "",
        state: brief.state || "",
        status: brief.status || "PUBLISHED"
      });
    }
  }, [brief]);

  // Update brief mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/briefs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          reward: {
            type: data.rewardType,
            amount: data.rewardType === "CASH" ? parseFloat(data.rewardAmount) : data.rewardAmount,
            currency: data.rewardType === "CASH" ? "USD" : undefined,
            description: data.rewardType === "OTHER" ? data.rewardDescription : undefined
          }
        }),
      });
      if (!response.ok) throw new Error("Failed to update brief");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Brief Updated",
        description: "Your changes have been saved successfully.",
      });
      setLocation(`/admin/briefs/${id}`);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    setFormData({ ...formData, requirements: updated });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ""]
    });
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData({
        ...formData,
        requirements: formData.requirements.filter((_, i) => i !== index)
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (!brief) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Brief not found</h2>
          <Button onClick={() => setLocation("/admin/briefs")}>
            Back to Briefs
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            className="pl-0 mb-4 hover:bg-transparent hover:text-primary"
            onClick={() => setLocation(`/admin/briefs/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Brief
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">Edit Brief</h1>
              <p className="text-muted-foreground mt-1">Update your brief details and requirements.</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(`/admin/briefs/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {brief.status === 'PUBLISHED' && brief.submissionCount > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This brief is live and has {brief.submissionCount} submission{brief.submissionCount !== 1 ? 's' : ''}. 
              Changes will be visible to creators immediately.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your brief</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Brief Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Product Launch Campaign"
                  required
                />
              </div>

              <div>
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Describe what you're looking for..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessLine">Business Line</Label>
                  <Select
                    value={formData.businessLine}
                    onValueChange={(value) => setFormData({ ...formData, businessLine: value })}
                  >
                    <SelectTrigger id="businessLine">
                      <SelectValue placeholder="Select business line" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sportsbook">Sportsbook</SelectItem>
                      <SelectItem value="Casino">Casino</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What creators need to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Enter a requirement"
                    required
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
              >
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          {/* Deliverable Details */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Details</CardTitle>
              <CardDescription>Specifications for the content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="format">Content Format</Label>
                <Select
                  value={formData.deliverableFormat}
                  onValueChange={(value) => setFormData({ ...formData, deliverableFormat: value })}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTAGRAM_REELS">Instagram Reels</SelectItem>
                    <SelectItem value="TIKTOK">TikTok</SelectItem>
                    <SelectItem value="YOUTUBE_SHORTS">YouTube Shorts</SelectItem>
                    <SelectItem value="INSTAGRAM_STORIES">Instagram Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ratio">Aspect Ratio</Label>
                  <Input
                    id="ratio"
                    value={formData.deliverableRatio}
                    onChange={(e) => setFormData({ ...formData, deliverableRatio: e.target.value })}
                    placeholder="e.g., 9:16"
                  />
                </div>
                <div>
                  <Label htmlFor="length">Video Length</Label>
                  <Input
                    id="length"
                    value={formData.deliverableLength}
                    onChange={(e) => setFormData({ ...formData, deliverableLength: e.target.value })}
                    placeholder="e.g., 15-30 seconds"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward */}
          <Card>
            <CardHeader>
              <CardTitle>Reward</CardTitle>
              <CardDescription>What creators will receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.rewardType}
                onValueChange={(value) => setFormData({ ...formData, rewardType: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash">Cash Reward</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OTHER" id="other" />
                  <Label htmlFor="other">Other Reward (Gift, Product, etc.)</Label>
                </div>
              </RadioGroup>

              {formData.rewardType === 'CASH' ? (
                <div>
                  <Label htmlFor="amount">Reward Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="rewardDesc">Reward Description</Label>
                  <Input
                    id="rewardDesc"
                    value={formData.rewardDescription}
                    onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
                    placeholder="e.g., $500 Gift Card"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>Manage deadlines and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deadline">Submission Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="winners">Max Winners</Label>
                  <Input
                    id="winners"
                    type="number"
                    min="1"
                    value={formData.maxWinners}
                    onChange={(e) => setFormData({ ...formData, maxWinners: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="submissions">Max Submissions Per Creator</Label>
                  <Input
                    id="submissions"
                    type="number"
                    min="1"
                    value={formData.maxSubmissionsPerCreator}
                    onChange={(e) => setFormData({ ...formData, maxSubmissionsPerCreator: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Brief Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Changing to Draft, Closed, or Archived will hide the brief from creators
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}