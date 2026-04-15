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
import AdminFinance from "@/pages/admin/AdminFinance";
import CreateBriefPage from "@/pages/admin/CreateBriefPage";
import EditBriefPage from "@/pages/admin/EditBriefPage";
import AdminInfluencers from "@/pages/admin/AdminInfluencers";
import LoginPage from "@/pages/auth/LoginPage";
import AccountSettingsPage from "@/pages/account/AccountSettingsPage";
import AdminSettings from "@/pages/admin/AdminSettings";
import InfluencerSubmissionPage from "@/pages/influencer/SubmissionPage";
import InfluencerDashboard from "@/pages/influencer/InfluencerDashboard";
import BriefAssignmentsPage from "@/pages/admin/BriefAssignmentsPage";

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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Check if user is admin
  if (user.userType !== 'admin' && user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  if (!user.isOnboarded) {
    return <Redirect to="/onboarding" />;
  }

  return <>{children}</>;
}

function InfluencerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Check if user is influencer
  if (user.userType !== 'influencer') {
    return <Redirect to="/admin" />;
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
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/apply" component={ApplyPage} />
      <Route path="/apply/success" component={ApplySuccessPage} />
      <Route path="/welcome" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingRoute} />

      {/* Admin routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/briefs">
        <AdminRoute>
          <AdminBriefs />
        </AdminRoute>
      </Route>
      <Route path="/admin/briefs/new">
        <AdminRoute>
          <CreateBriefPage />
        </AdminRoute>
      </Route>
      <Route path="/admin/briefs/:id/edit">
        <AdminRoute>
          <EditBriefPage />
        </AdminRoute>
      </Route>
      <Route path="/admin/briefs/:id">
        <AdminRoute>
          <AdminBriefDetail />
        </AdminRoute>
      </Route>
      <Route path="/admin/briefs/:id/assignments">
        <AdminRoute>
          <BriefAssignmentsPage />
        </AdminRoute>
      </Route>
      <Route path="/admin/finance">
        <AdminRoute>
          <AdminFinance />
        </AdminRoute>
      </Route>
      <Route path="/admin/influencers">
        <AdminRoute>
          <AdminInfluencers />
        </AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute>
          <AdminSettings />
        </AdminRoute>
      </Route>

      {/* Influencer routes */}
      <Route path="/dashboard">
        <InfluencerRoute>
          <InfluencerDashboard />
        </InfluencerRoute>
      </Route>
      <Route path="/briefs/:id">
        <InfluencerRoute>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Brief Detail Page</h2>
              <p className="text-slate-400">Coming soon - Click "Submit Video" from dashboard</p>
            </div>
          </div>
        </InfluencerRoute>
      </Route>
      <Route path="/briefs/:id/submit">
        <InfluencerRoute>
          <InfluencerSubmissionPage />
        </InfluencerRoute>
      </Route>

      {/* Protected account settings */}
      <Route path="/account/settings">
        <ProtectedRoute>
          <AccountSettingsPage />
        </ProtectedRoute>
      </Route>

      {/* Talent Portal - shows only assigned briefs */}
      <Route path="/portal" component={InfluencerPortalPage} />

      {/* Public brief routes removed - now require authentication */}
      {/* <Route path="/briefs" component={BriefsListPage} /> */}
      {/* <Route path="/b/:slug" component={BriefPublicPage} /> */}
      {/* <Route path="/b/:slug/submit" component={BriefSubmitPage} /> */}

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
