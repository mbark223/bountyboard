import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import BriefsListPage from "@/pages/public/BriefsListPage";
import BriefPublicPage from "@/pages/public/BriefPublicPage";
import BriefSubmitPage from "@/pages/public/BriefSubmitPage";
import SubmissionStatusPage from "@/pages/public/SubmissionStatusPage";
import ApplyPage from "@/pages/public/ApplyPage";
import ApplySuccessPage from "@/pages/public/ApplySuccessPage";
import InfluencerPortalPage from "@/pages/public/InfluencerPortalPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBriefs from "@/pages/admin/AdminBriefs";
import AdminBriefDetail from "@/pages/admin/AdminBriefDetail";
import CreateBriefPage from "@/pages/admin/CreateBriefPage";
import EditBriefPage from "@/pages/admin/EditBriefPage";
import AdminInfluencers from "@/pages/admin/AdminInfluencers";
import LoginPage from "@/pages/auth/LoginPage";
import AccountSettingsPage from "@/pages/account/AccountSettingsPage";
import AdminSettings from "@/pages/admin/AdminSettings";
import InfluencerSubmissionPage from "@/pages/influencer/SubmissionPage";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!user.isOnboarded) {
    return <Redirect to="/onboarding" />;
  }

  return <>{children}</>;
}

function OnboardingRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.isOnboarded) {
    return <Redirect to="/admin" />;
  }

  return <OnboardingPage user={user} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/briefs" component={BriefsListPage} />
      <Route path="/b/:slug" component={BriefPublicPage} />
      <Route path="/b/:slug/submit" component={BriefSubmitPage} />
      <Route path="/submission-status" component={SubmissionStatusPage} />
      <Route path="/apply" component={ApplyPage} />
      <Route path="/apply/success" component={ApplySuccessPage} />
      <Route path="/portal" component={InfluencerPortalPage} />
      <Route path="/welcome" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingRoute} />
      <Route path="/account/settings" component={AccountSettingsPage} />
      <Route path="/influencer/submit/:briefId" component={InfluencerSubmissionPage} />
      
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/briefs">
        <ProtectedRoute>
          <AdminBriefs />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/briefs/new">
        <ProtectedRoute>
          <CreateBriefPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/briefs/:id/edit">
        {(params) => (
          <ProtectedRoute>
            <EditBriefPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/briefs/:id">
        {(params) => (
          <ProtectedRoute>
            <AdminBriefDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/influencers">
        <ProtectedRoute>
          <AdminInfluencers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute>
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      
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
