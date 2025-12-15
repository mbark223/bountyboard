import { useParams, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { MOCK_BRIEFS } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Video, 
  AlertCircle, 
  ArrowRight,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";

export default function BriefPublicPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const brief = MOCK_BRIEFS.find((b) => b.slug === slug);

  if (!brief) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Brief Not Found</h1>
          <p className="text-muted-foreground">The brief you are looking for does not exist or has been archived.</p>
        </div>
      </PublicLayout>
    );
  }

  const isCash = brief.reward.type === 'CASH';

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-16 md:py-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/20 text-primary bg-primary/5 uppercase tracking-wider">
                {brief.orgName}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight">
                {brief.title}
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card shadow-lg border border-border/50">
                {isCash ? (
                  <DollarSign className="h-6 w-6 text-green-500" />
                ) : (
                  <Gift className="h-6 w-6 text-purple-500" />
                )}
                <span className="text-2xl font-bold font-heading text-foreground">
                  {brief.reward.type === 'OTHER' 
                    ? brief.reward.amount 
                    : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                </span>
                <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium ml-1">
                  Bounty
                </span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {brief.overview}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-8">
          
          {/* Main Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-8 border-b border-border/50">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 h-auto shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={() => setLocation(`/b/${brief.slug}/submit`)}
            >
              Submit Your Video
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Deadline: {new Date(brief.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Sidebar / Specs */}
            <div className="space-y-6">
              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Deliverables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Aspect Ratio</span>
                    <span className="font-medium">{brief.deliverables.ratio}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Length</span>
                    <span className="font-medium">{brief.deliverables.length}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Format</span>
                    <span className="font-medium">{brief.deliverables.format}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/30 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                    <AlertCircle className="h-5 w-5" />
                    Important
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-800/80 dark:text-yellow-200/80">
                  Please ensure you have the rights to all music and imagery used in your submission.
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-heading font-semibold mb-6">Requirements</h3>
                <ul className="space-y-4">
                  {brief.requirements.map((req, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-primary group-hover:text-white" />
                      </div>
                      <span className="text-foreground/90 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-2xl font-heading font-semibold mb-6">Reward Details</h3>
                <p className="text-muted-foreground mb-4">
                  If your video is selected by the {brief.orgName} team, you will receive the following bounty:
                </p>
                <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400">
                    {isCash ? <DollarSign className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">
                      {brief.reward.type === 'OTHER' ? brief.reward.amount : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {brief.reward.description || (isCash ? "Cash payout via bank transfer or PayPal upon selection." : "Reward package sent to your address.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
