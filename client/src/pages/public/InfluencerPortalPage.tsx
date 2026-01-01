import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { transformBrief } from "@/lib/transformers";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Gift,
  Clock,
  Video,
  ArrowRight,
  Loader2,
  Building2,
  Users,
  LogIn,
  User,
  Instagram,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface InfluencerPortalData {
  influencer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    instagramHandle: string;
    status: string;
  };
  briefs: any[];
}

async function fetchPortalData(email: string): Promise<InfluencerPortalData> {
  const response = await fetch(`/api/influencers/portal?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch portal data");
  }
  return response.json();
}

export default function InfluencerPortalPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch() || "");
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam || "");
  const [submittedEmail, setSubmittedEmail] = useState(emailParam || "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["influencer-portal", submittedEmail],
    queryFn: () => fetchPortalData(submittedEmail),
    enabled: !!submittedEmail,
    retry: false,
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmittedEmail(email);
      // Update URL with email parameter
      setLocation(`/portal?email=${encodeURIComponent(email)}`);
    }
  };

  if (!submittedEmail) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Influencer Portal</CardTitle>
              <CardDescription>
                Access your exclusive briefs and track your submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Enter your registered email
                  </label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="influencer@example.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Access Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => {
              setSubmittedEmail("");
              setEmail("");
              setLocation("/portal");
            }}>
              Try Again
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const briefs = data?.briefs.map(transformBrief) || [];

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                Welcome back, {data?.influencer.firstName}!
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved Creator
                </Badge>
              </h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {data?.influencer.email}
                </span>
                <span className="flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  @{data?.influencer.instagramHandle}
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Here are the available briefs you can submit to
          </p>
        </div>

        {briefs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No active briefs available at the moment.</p>
              <p className="text-sm mt-2">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {briefs.map((brief, index) => (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {brief.orgName}
                      </Badge>
                      {brief.reward.type === 'CASH' ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Cash
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                          <Gift className="h-3 w-3 mr-1" />
                          Product
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">
                      {brief.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {brief.overview}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="font-medium">
                          {brief.reward.type === 'OTHER' 
                            ? brief.reward.amount 
                            : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Video className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{brief.deliverables.format} • {brief.deliverables.length}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>Due {new Date(brief.deadline).toLocaleDateString()}</span>
                      </div>

                      {brief.maxWinners && brief.maxWinners > 1 && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>Up to {brief.maxWinners} winners</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setLocation(`/b/${brief.slug}`)}
                    >
                      View & Submit
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}