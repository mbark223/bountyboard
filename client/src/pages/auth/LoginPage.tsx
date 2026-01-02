import { useState } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Mail, Shield, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"creator" | "influencer">("creator");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
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
            <h1 className="text-2xl font-bold mb-2">Check your email!</h1>
            <p className="text-muted-foreground mb-8">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <Card className="text-left">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Next steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Open your email inbox</li>
                  <li>Find the email from BountyBoard</li>
                  <li>Click the "Sign In" button</li>
                  <li>You'll be automatically logged in</li>
                </ol>
                <p className="mt-4 text-sm text-muted-foreground">
                  The link expires in 15 minutes for security reasons.
                </p>
              </CardContent>
            </Card>
            <Button
              variant="ghost"
              className="mt-6"
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
            >
              Send another link
            </Button>
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
                      userType === "creator" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="creator" id="creator" className="mt-0.5" />
                      <label htmlFor="creator" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-semibold">Content Creator</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Create content, submit to briefs, and earn rewards
                        </p>
                      </label>
                    </div>
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      userType === "influencer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}>
                      <RadioGroupItem value="influencer" id="influencer" className="mt-0.5" />
                      <label htmlFor="influencer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4" />
                          <span className="font-semibold">Vetted Influencer</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Access exclusive briefs and premium opportunities
                        </p>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
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
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send me a magic link
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Are you a brand? {" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Sign in with Replit
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}