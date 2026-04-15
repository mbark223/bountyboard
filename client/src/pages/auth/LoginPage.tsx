import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Lock, Shield, Sparkles, CheckCircle, UserPlus, UserCheck, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const typeParam = searchParams.get('type');

  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"approved-talent" | "admin">(
    typeParam === 'talent' ? 'approved-talent' : 'admin'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call test login endpoint
      const response = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Handle 403 with specific influencer status messages
        if (response.status === 403 && data.status) {
          const statusMessages = {
            pending: "Your application is pending review. We'll notify you once it's been approved!",
            rejected: "Your application was not approved. If you have questions, please contact support.",
            suspended: "Your account has been suspended. Please contact support for assistance."
          };

          throw new Error(statusMessages[data.status as keyof typeof statusMessages] || data.error);
        }

        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();

      // Store user data in localStorage for session persistence
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      // Success! Show success message and redirect
      setSuccess(true);

      setTimeout(() => {
        // Redirect based on user type
        if (data.user.userType === "admin") {
          setLocation("/admin");
        } else if (data.user.userType === "influencer") {
          setLocation("/portal");
        } else {
          setLocation("/");
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <div className="container max-w-md mx-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Granted!</h1>
            <p className="text-muted-foreground mb-8">
              Redirecting you to available briefs...
            </p>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-lg mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Welcome to BountyBoard</CardTitle>
              <CardDescription>
                Sign in or create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Type Selection */}
                <div className="space-y-3">
                  <Label>I am a...</Label>
                  <RadioGroup value={userType} onValueChange={(value: any) => setUserType(value)}>
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      userType === "approved-talent" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="approved-talent" id="approved-talent" className="mt-0.5" />
                      <label htmlFor="approved-talent" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="h-4 w-4" />
                          <span className="font-semibold">Approved Talent</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Login to access your assigned briefs
                        </p>
                      </label>
                    </div>
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      userType === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="admin" id="admin" className="mt-0.5" />
                      <label htmlFor="admin" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="h-4 w-4" />
                          <span className="font-semibold">Admin</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage briefs, talent, and assignments
                        </p>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      userType === "admin" ? "admin@test.com" : "talent@test.com"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {userType === "approved-talent" && "Test account: talent@test.com"}
                    {userType === "admin" && "Test account: admin@test.com"}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}