import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Clock, Mail } from "lucide-react";

export default function ApplySuccessPage() {
  const [, setLocation] = useLocation();

  return (
    <PublicLayout>
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
            <CardDescription className="mt-2">
              Thank you for applying to become a BountyBoard creator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-start gap-3 text-left">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Review Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    We typically review applications within 2-3 business days
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email once your application has been reviewed
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => setLocation("/")}
                className="gap-2"
              >
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}