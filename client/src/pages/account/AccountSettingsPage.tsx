import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Mail, User, Calendar, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto py-16">
          <Alert>
            <AlertDescription>
              Please sign in to access your account settings.
            </AlertDescription>
          </Alert>
        </div>
      </PublicLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (userType: string | null) => {
    switch (userType) {
      case "admin":
        return "Administrator";
      case "influencer":
        return "Vetted Influencer";
      case "creator":
        return "Content Creator";
      default:
        return userType || "User";
    }
  };

  return (
    <PublicLayout>
      <div className="container max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Account Type</Label>
                  <p className="font-medium">{getUserTypeLabel(user.userType)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email Verified</Label>
                  <p className="font-medium">{user.emailVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Member Since</Label>
                  <p className="font-medium">
                    {user.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Login</Label>
                  <p className="font-medium">
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Changing your email will require verification
                  </p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
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
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & Security
              </CardTitle>
              <CardDescription>
                Manage your authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  You use passwordless authentication. To sign in, we'll send a magic link to your email address.
                </p>
                <Button variant="outline" onClick={() => window.location.href = "/api/logout"}>
                  Sign Out of All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}