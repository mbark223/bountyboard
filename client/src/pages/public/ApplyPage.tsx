import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  User,
  Mail,
  Phone
} from "lucide-react";

interface ApplicationFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Social Media
  instagramHandle: string;
  tiktokHandle?: string;
}

async function submitApplication(data: ApplicationFormData & { inviteCode?: string }) {
  const response = await fetch("/api/influencers/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = "Failed to submit application";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        errorMessage = text.substring(0, 100); // Limit error message length
      } catch (textError) {
        errorMessage = `Server error (${response.status})`;
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export default function ApplyPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch() || "");
  const inviteCode = searchParams.get("code");
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    instagramHandle: "",
    tiktokHandle: "",
  });

  const mutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      // Redirect to success page
      setLocation("/apply/success");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up data - remove empty strings and fix Instagram handle
    const cleanedData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      instagramHandle: formData.instagramHandle.replace("@", ""),
    };

    // Add optional fields only if they have values
    if (formData.phone) cleanedData.phone = formData.phone;
    if (formData.tiktokHandle) cleanedData.tiktokHandle = formData.tiktokHandle.replace("@", "");
    if (inviteCode) cleanedData.inviteCode = inviteCode;
    
    mutation.mutate(cleanedData);
  };

  const updateField = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PublicLayout>
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold mb-2">Become a BountyBoard Creator</h1>
          <p className="text-muted-foreground">
            Join our network of talented content creators and start earning
          </p>
        </div>

        {inviteCode && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              You've been invited to join BountyBoard! Your invite code has been applied.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="pl-9"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Social Media
              </CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram Handle</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={formData.instagramHandle}
                    onChange={(e) => updateField("instagramHandle", e.target.value)}
                    placeholder="@username"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok Handle (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">TT</span>
                  <Input
                    id="tiktok"
                    value={formData.tiktokHandle}
                    onChange={(e) => updateField("tiktokHandle", e.target.value)}
                    placeholder="@username"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}