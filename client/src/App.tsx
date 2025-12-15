import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import BriefPublicPage from "@/pages/public/BriefPublicPage";
import BriefSubmitPage from "@/pages/public/BriefSubmitPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBriefs from "@/pages/admin/AdminBriefs";
import AdminBriefDetail from "@/pages/admin/AdminBriefDetail";

// Landing page redirecting to a demo brief
function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-heading font-bold mb-4">BountyBoard Prototype</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        This is a prototype of the Briefs & Bounties portal. 
        Choose a role to view the app:
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/b/summer-vibes-campaign" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
          View as Creator (Public)
        </Link>
        <Link href="/admin" className="px-6 py-3 rounded-lg bg-card border border-border font-medium hover:bg-muted transition-colors">
          View as Admin (HR)
        </Link>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Public Routes */}
      <Route path="/b/:slug" component={BriefPublicPage} />
      <Route path="/b/:slug/submit" component={BriefSubmitPage} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/briefs" component={AdminBriefs} />
      <Route path="/admin/briefs/new" component={() => <div>Create Brief Placeholder</div>} />
      <Route path="/admin/briefs/:id" component={AdminBriefDetail} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
