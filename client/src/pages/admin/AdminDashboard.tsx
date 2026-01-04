import { AdminLayout } from "@/components/layout/AdminLayout";
import { MOCK_SUBMISSIONS } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, DollarSign, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminBriefs } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function AdminDashboard() {
  // Fetch briefs from API
  const { data: briefs = [], isLoading } = useQuery({
    queryKey: ["adminBriefs"],
    queryFn: fetchAdminBriefs,
  });

  const activeBriefs = briefs.filter(b => b.status === 'PUBLISHED').length;
  const totalSubmissions = briefs.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0);
  const pendingReviews = MOCK_SUBMISSIONS.filter(s => s.status === 'RECEIVED' || s.status === 'IN_REVIEW').length;
  const totalPaid = 1500; // Mocked

  const stats = [
    { title: "Active Briefs", value: activeBriefs, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Submissions", value: totalSubmissions, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Pending Review", value: pendingReviews, icon: CheckCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Bounties Paid", value: formatCurrency(totalPaid), icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your campaign performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/60 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Briefs */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Briefs</CardTitle>
            <Link href="/admin/briefs" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {briefs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No briefs yet. <Link href="/admin/briefs/new" className="text-primary hover:underline">Create your first brief</Link>
                </p>
              ) : (
                briefs.slice(0, 5).map((brief) => (
                <Link
                  key={brief.id}
                  href={`/admin/briefs/${brief.id}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer block"
                  onClick={(e) => {
                    console.log('Brief clicked:', brief.id);
                  }}
                >
                  <div>
                    <h4 className="font-semibold text-sm">{brief.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        brief.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {brief.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(brief.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{brief.submissionCount || 0} subs</div>
                    <div className="text-xs text-muted-foreground">
                      {brief.rewardType === 'OTHER' ? brief.rewardDescription || 'Gift' : formatCurrency(Number(brief.rewardAmount) || 0)}
                    </div>
                  </div>
                </Link>
              ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (Mock) */}
        <Card className="border-border/60 shadow-sm col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">New Submission</span> received for <span className="font-medium">Summer Vibes Campaign</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
