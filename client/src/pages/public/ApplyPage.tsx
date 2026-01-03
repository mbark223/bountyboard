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
  DollarSign,
  Building,
  User,
  Mail,
  Phone,
  Hash,
  Youtube,
  Shield
} from "lucide-react";

interface ApplicationFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Social Media
  instagramHandle: string;
  instagramFollowers?: number;
  tiktokHandle?: string;
  youtubeChannel?: string;
  
  // Banking Info
  bankAccountHolderName: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: "checking" | "savings";
  taxIdNumber: string;
}

async function submitApplication(data: ApplicationFormData & { inviteCode?: string }) {
  const response = await fetch("/api/influencers/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit application");
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
    instagramFollowers: undefined,
    tiktokHandle: "",
    youtubeChannel: "",
    bankAccountHolderName: "",
    bankRoutingNumber: "",
    bankAccountNumber: "",
    bankAccountType: "checking",
    taxIdNumber: "",
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
    if (formData.instagramFollowers) cleanedData.instagramFollowers = formData.instagramFollowers;
    if (formData.tiktokHandle) cleanedData.tiktokHandle = formData.tiktokHandle;
    if (formData.youtubeChannel) cleanedData.youtubeChannel = formData.youtubeChannel;
    if (formData.bankAccountHolderName) cleanedData.bankAccountHolderName = formData.bankAccountHolderName;
    if (formData.bankRoutingNumber) cleanedData.bankRoutingNumber = formData.bankRoutingNumber;
    if (formData.bankAccountNumber) cleanedData.bankAccountNumber = formData.bankAccountNumber;
    if (formData.bankAccountType) cleanedData.bankAccountType = formData.bankAccountType;
    if (formData.taxIdNumber) cleanedData.taxIdNumber = formData.taxIdNumber;
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
                <Label htmlFor="followers">Instagram Followers</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="followers"
                    type="number"
                    value={formData.instagramFollowers || ""}
                    onChange={(e) => updateField("instagramFollowers", e.target.value ? parseInt(e.target.value) : undefined)}
                    className="pl-9"
                    placeholder="10000"
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
              <div>
                <Label htmlFor="youtube">YouTube Channel (Optional)</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube"
                    value={formData.youtubeChannel}
                    onChange={(e) => updateField("youtubeChannel", e.target.value)}
                    placeholder="channel/UCxxxxxx"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Banking Information
              </CardTitle>
              <CardDescription>Required for payments. All information is encrypted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  Your banking information is encrypted and stored securely. We only use this for direct payments.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={formData.bankAccountHolderName}
                  onChange={(e) => updateField("bankAccountHolderName", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input
                    id="routing"
                    value={formData.bankRoutingNumber}
                    onChange={(e) => updateField("bankRoutingNumber", e.target.value)}
                    placeholder="123456789"
                    maxLength={9}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    value={formData.bankAccountNumber}
                    onChange={(e) => updateField("bankAccountNumber", e.target.value)}
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    value={formData.bankAccountType}
                    onChange={(e) => updateField("bankAccountType", e.target.value as "checking" | "savings")}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID Number (SSN/EIN)</Label>
                  <Input
                    id="taxId"
                    value={formData.taxIdNumber}
                    onChange={(e) => updateField("taxIdNumber", e.target.value)}
                    placeholder="123-45-6789"
                    required
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