import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Lock, Shield, Sparkles, CheckCircle, DollarSign, Gift, Clock, Video, ArrowRight, Building2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchBriefs } from "@/lib/api";
import { transformBrief } from "@/lib/transformers";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"creator" | "influencer">("creator");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: briefsData, isLoading: briefsLoading } = useQuery({
    queryKey: ["briefs"],
    queryFn: fetchBriefs,
  });

  const briefs = briefsData?.map(transformBrief) || [];
  const activeBriefs = briefs.slice(0, 3); // Show first 3 briefs

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== "HardRockBet") {
      setError("Invalid password");
      setIsLoading(false);
      return;
    }

    // For demo purposes, redirect to briefs list
    setSuccess(true);
    setTimeout(() => {
      setLocation("/briefs");
    }, 1000);
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
      <div className="container mx-auto py-8">
        {/* Active Briefs Section */}
        {activeBriefs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-semibold mb-6">Active Briefs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBriefs.map((brief, index) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setLocation(`/b/${brief.slug}`)}
                  className="cursor-pointer"
                >
                  <Card className="h-full flex flex-col border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden bg-card">
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {brief.organization.logoUrl ? (
                            <img 
                              src={brief.organization.logoUrl} 
                              alt={brief.orgName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <Badge variant="outline" className="font-medium text-xs uppercase tracking-wider bg-secondary/50">
                            {brief.orgName}
                          </Badge>
                        </div>
                        {brief.reward.type === 'CASH' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Cash
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                            <Gift className="h-3 w-3 mr-1" />
                            Product
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-heading font-bold leading-tight hover:text-primary transition-colors">
                        {brief.title}
                      </h3>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {brief.overview}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-foreground/80">
                          {brief.reward.type === 'OTHER' ? (
                            <Gift className="h-4 w-4 text-purple-500 mr-2" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          <span className="font-bold">
                            {brief.reward.type === 'OTHER' 
                              ? brief.reward.amount 
                              : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                          </span>
                          <span className="text-muted-foreground ml-1 font-normal">
                            Bounty
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-foreground/80">
                          <Clock className="h-4 w-4 text-orange-500 mr-2" />
                          <span>Due {new Date(brief.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => setLocation("/")}>
                View all briefs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Login Form */}
        <div className="max-w-lg mx-auto">
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

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Unlock Briefs
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
      </div>
    </PublicLayout>
  );
}