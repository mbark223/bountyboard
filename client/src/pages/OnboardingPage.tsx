import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Zap, Building2, Globe, FileText, ArrowRight } from "lucide-react";
import type { User } from "@shared/models/auth";

interface OnboardingFormData {
  orgName: string;
  orgSlug: string;
  orgWebsite: string;
  orgDescription: string;
}

export default function OnboardingPage({ user }: { user: User }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
  };
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    orgName: user.orgName || "",
    orgSlug: user.orgSlug || "",
    orgWebsite: user.orgWebsite || "",
    orgDescription: user.orgDescription || "",
  });

  useEffect(() => {
    if (user.orgName && !formData.orgSlug) {
      setFormData((prev) => ({
        ...prev,
        orgSlug: generateSlug(user.orgName!),
      }));
    }
  }, [user.orgName]);

  const handleOrgNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      orgName: value,
      orgSlug: prev.orgSlug || generateSlug(value),
    }));
  };

  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete onboarding");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to BountyBoard!",
        description: "Your organization has been set up successfully.",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orgName.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter your organization or brand name.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.orgSlug.trim()) {
      toast({
        title: "URL slug required",
        description: "Please enter a URL slug for your organization.",
        variant: "destructive",
      });
      return;
    }
    onboardMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-outfit mb-2">
            Set Up Your Organization
          </h1>
          <p className="text-slate-400">
            Tell us about your brand to start posting bounties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Organization Name *
              </Label>
              <Input
                id="orgName"
                value={formData.orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                placeholder="Acme Inc."
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                data-testid="input-org-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgSlug" className="text-slate-200 flex items-center gap-2">
                URL Slug *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">/org/</span>
                <Input
                  id="orgSlug"
                  value={formData.orgSlug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orgSlug: generateSlug(e.target.value) }))}
                  placeholder="acme-inc"
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="input-org-slug"
                />
              </div>
              <p className="text-xs text-slate-500">This will be used in your public URLs.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgWebsite" className="text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </Label>
              <Input
                id="orgWebsite"
                type="url"
                value={formData.orgWebsite}
                onChange={(e) => setFormData((prev) => ({ ...prev, orgWebsite: e.target.value }))}
                placeholder="https://acme.com"
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                data-testid="input-org-website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgDescription" className="text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4" /> About Your Brand
              </Label>
              <Textarea
                id="orgDescription"
                value={formData.orgDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, orgDescription: e.target.value }))}
                placeholder="Tell creators about your brand, products, and the type of content you're looking for..."
                rows={4}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                data-testid="input-org-description"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={onboardMutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-lg"
            data-testid="button-complete-setup"
          >
            {onboardMutation.isPending ? (
              "Setting up..."
            ) : (
              <>
                Complete Setup <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
