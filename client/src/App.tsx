import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import BriefsListPage from "@/pages/public/BriefsListPage";
import BriefPublicPage from "@/pages/public/BriefPublicPage";
import BriefSubmitPage from "@/pages/public/BriefSubmitPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBriefs from "@/pages/admin/AdminBriefs";
import AdminBriefDetail from "@/pages/admin/AdminBriefDetail";

function Router() {
  return (
    <Switch>
      {/* Public Routes - Home is now the Briefs Board */}
      <Route path="/" component={BriefsListPage} />
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
