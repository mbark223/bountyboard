import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Globe, FileText, ArrowRight, Loader2, Wand2 } from "lucide-react";
import type { User } from "@shared/models/auth";

interface OnboardingFormData {
  orgName: string;
  orgSlug: string;
  orgWebsite: string;
  orgDescription: string;
  orgLogoUrl: string;
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
    orgLogoUrl: user.orgLogoUrl || "",
  });

  const fetchBrandMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/fetch-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch brand info");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const updates: Partial<OnboardingFormData> = {};
      if (data.title && !formData.orgName) {
        updates.orgName = data.title;
        updates.orgSlug = generateSlug(data.title);
      }
      if (data.description && !formData.orgDescription) {
        updates.orgDescription = data.description;
      }
      if (data.logo || data.favicon) {
        updates.orgLogoUrl = data.logo || data.favicon;
      }
      setFormData((prev) => ({ ...prev, ...updates }));
      toast({
        title: "Brand info loaded!",
        description: "We found your brand details. Review and adjust as needed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't fetch brand info",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user.orgName && !formData.orgSlug) {
      setFormData((prev) => ({
        ...prev,
        orgSlug: generateSlug(user.orgName!),
      }));
    }
  }, [user.orgName]); // Remove formData.orgSlug to prevent circular dependency

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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#7B5CFA]/5 to-transparent pointer-events-none" />
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <img src="/hrb-logo.png" alt="Hard Rock Bet" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-heading text-white mb-2 tracking-wide">
            SET UP YOUR ORGANIZATION
          </h1>
          <p className="text-gray-400">
            Tell us about your brand to start posting bounties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-gray-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#7B5CFA]" /> Organization Name *
              </Label>
              <Input
                id="orgName"
                value={formData.orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                placeholder="Acme Inc."
                className="bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#7B5CFA]"
                data-testid="input-org-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgSlug" className="text-gray-200 flex items-center gap-2">
                URL Slug *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">/org/</span>
                <Input
                  id="orgSlug"
                  value={formData.orgSlug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orgSlug: generateSlug(e.target.value) }))}
                  placeholder="acme-inc"
                  className="bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#7B5CFA]"
                  data-testid="input-org-slug"
                />
              </div>
              <p className="text-xs text-gray-500">This will be used in your public URLs.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgWebsite" className="text-gray-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#7B5CFA]" /> Website
              </Label>
              <div className="flex gap-2">
                <Input
                  id="orgWebsite"
                  type="url"
                  value={formData.orgWebsite}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orgWebsite: e.target.value }))}
                  placeholder="https://acme.com"
                  className="bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#7B5CFA] flex-1"
                  data-testid="input-org-website"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!formData.orgWebsite || fetchBrandMutation.isPending}
                  onClick={() => fetchBrandMutation.mutate(formData.orgWebsite)}
                  className="shrink-0 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border-0"
                  data-testid="button-fetch-brand"
                >
                  {fetchBrandMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-1" /> Fetch Info
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Enter your website URL and click "Fetch Info" to auto-fill your brand details.</p>
            </div>

            {formData.orgLogoUrl && (
              <div className="space-y-2">
                <Label className="text-gray-200">Brand Logo (from website)</Label>
                <div className="flex items-center gap-4 p-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg">
                  <img 
                    src={formData.orgLogoUrl} 
                    alt="Brand logo" 
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-gray-400 truncate flex-1">{formData.orgLogoUrl}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, orgLogoUrl: "" }))}
                    className="text-gray-400 hover:text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="orgDescription" className="text-gray-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7B5CFA]" /> About Your Brand
              </Label>
              <Textarea
                id="orgDescription"
                value={formData.orgDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, orgDescription: e.target.value }))}
                placeholder="Tell creators about your brand, products, and the type of content you're looking for..."
                rows={4}
                className="bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-gray-600 focus:border-[#7B5CFA] resize-none"
                data-testid="input-org-description"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={onboardMutation.isPending}
            className="w-full bg-gradient-to-r from-[#7B5CFA] to-[#9B7DFF] hover:from-[#6B4EE6] hover:to-[#8B6DFF] text-black font-semibold text-lg"
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
