import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  DollarSign,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Wallet,
  CreditCard
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface FinanceSubmission {
  id: number;
  creatorName: string;
  creatorEmail: string;
  creatorHandle: string;
  briefId: number;
  briefTitle: string;
  status: string;
  payoutStatus: string;
  financeApprovalStatus: string | null;
  financeApprovedBy: string | null;
  financeApprovedAt: string | null;
  paidAt: string | null;
  selectedAt: string;
  payoutNotes: string | null;
  rewardType: string;
  rewardAmount: string;
  rewardCurrency: string;
  rewardDescription: string | null;
}

interface FinanceStats {
  awaitingFinance: number;
  readyToPay: number;
  paidToday: number;
  totalPendingAmount: string;
}

async function fetchFinanceSubmissions(status: string = 'all') {
  const response = await fetch(`/api/admin/finance-submissions?status=${status}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch finance submissions');
  }

  return response.json() as Promise<{
    submissions: FinanceSubmission[];
    stats: FinanceStats;
  }>;
}

export default function AdminFinance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'paid' | null;
    count: number;
  }>({ open: false, action: null, count: 0 });

  // Fetch submissions
  const { data, isLoading } = useQuery({
    queryKey: ['financeSubmissions', statusFilter],
    queryFn: async () => {
      console.log('[Finance Dashboard] Fetching submissions with filter:', statusFilter);
      const result = await fetchFinanceSubmissions(statusFilter);
      console.log('[Finance Dashboard] Received data:', result);
      console.log('[Finance Dashboard] Submissions count:', result.submissions.length);
      console.log('[Finance Dashboard] Stats:', result.stats);
      return result;
    },
  });

  const submissions = data?.submissions || [];
  const stats = data?.stats || {
    awaitingFinance: 0,
    readyToPay: 0,
    paidToday: 0,
    totalPendingAmount: '0.00'
  };

  console.log('[Finance Dashboard] Rendering with', submissions.length, 'submissions');
  console.log('[Finance Dashboard] Filter:', statusFilter);

  // Finance approval mutation
  const financeApprovalMutation = useMutation({
    mutationFn: async ({ submissionId, status }: { submissionId: number; status: 'approved' | 'rejected' }) => {
      const response = await fetch(`/api/submissions/${submissionId}/finance-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          userId: user?.id
        }),
      });
      if (!response.ok) throw new Error('Failed to update finance approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeSubmissions'] });
      toast({
        title: 'Finance Approval Updated',
        description: 'Submission has been approved for payment',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update finance approval',
        variant: 'destructive',
      });
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      const response = await fetch(`/api/submissions/${submissionId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id
        }),
      });
      if (!response.ok) throw new Error('Failed to mark submission as paid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeSubmissions'] });
      toast({
        title: 'Payment Completed',
        description: 'Submission marked as paid successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark submission as paid',
        variant: 'destructive',
      });
    },
  });

  // Bulk approve
  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await financeApprovalMutation.mutateAsync({ submissionId: id, status: 'approved' });
    }
    setSelectedIds([]);
    setConfirmDialog({ open: false, action: null, count: 0 });
  };

  // Bulk mark as paid
  const handleBulkMarkPaid = async () => {
    const approvedIds = selectedIds.filter(id => {
      const submission = submissions.find(s => s.id === id);
      return submission?.financeApprovalStatus === 'approved';
    });

    for (const id of approvedIds) {
      await markAsPaidMutation.mutateAsync(id);
    }
    setSelectedIds([]);
    setConfirmDialog({ open: false, action: null, count: 0 });
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id));
    }
  };

  const getStatusBadge = (submission: FinanceSubmission) => {
    if (submission.payoutStatus === 'PAID') {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          💰 Paid {submission.paidAt && `• ${new Date(submission.paidAt).toLocaleDateString()}`}
        </Badge>
      );
    }

    if (submission.financeApprovalStatus === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready to Pay
        </Badge>
      );
    }

    if (submission.financeApprovalStatus === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />
        Awaiting Approval
      </Badge>
    );
  };

  const canMarkAsPaid = (submission: FinanceSubmission) => {
    return submission.financeApprovalStatus === 'approved' && submission.payoutStatus !== 'PAID';
  };

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
        <h1 className="text-3xl font-heading font-bold tracking-tight text-white mb-1">Finance Dashboard</h1>
        <p className="text-gray-400">Manage payments for approved submissions</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Awaiting Finance</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.awaitingFinance}</div>
            <p className="text-xs text-gray-500 mt-1">Needs approval</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Ready to Pay</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.readyToPay}</div>
            <p className="text-xs text-gray-500 mt-1">Approved by finance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Paid Today</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.paidToday}</div>
            <p className="text-xs text-gray-500 mt-1">Completed payments</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pending</CardTitle>
            <Wallet className="h-4 w-4 text-[#7B5CFA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(parseFloat(stats.totalPendingAmount))}</div>
            <p className="text-xs text-gray-500 mt-1">Pending amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-[#0F0F0F] border border-[#1A1A1A]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Awaiting Finance</TabsTrigger>
          <TabsTrigger value="approved">Ready to Pay</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Card className="bg-[#7B5CFA]/10 border-[#7B5CFA] mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">
                {selectedIds.length} submission{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setConfirmDialog({ open: true, action: 'approve', count: selectedIds.length })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Finance ({selectedIds.length})
                </Button>
                <Button
                  onClick={() => setConfirmDialog({ open: true, action: 'paid', count: selectedIds.length })}
                  disabled={!selectedIds.every(id => {
                    const submission = submissions.find(s => s.id === id);
                    return submission?.financeApprovalStatus === 'approved';
                  })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Mark as Paid ({selectedIds.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions Table */}
      <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === submissions.length && submissions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-gray-400">Creator</TableHead>
                <TableHead className="text-gray-400">Brief</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Selected Date</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No submissions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="border-[#2A2A2A] hover:bg-[#1A1A1A] bg-[#0A0A0A]"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(submission.id)}
                        onCheckedChange={() => toggleSelection(submission.id)}
                      />
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="font-medium">{submission.creatorName}</div>
                      <div className="text-xs text-gray-500">{submission.creatorHandle}</div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setLocation(`/admin/briefs/${submission.briefId}`)}
                        className="text-[#7B5CFA] hover:underline text-left"
                      >
                        {submission.briefTitle || 'Brief Deleted'}
                      </button>
                    </TableCell>
                    <TableCell className="text-white">
                      {submission.rewardType === 'OTHER'
                        ? submission.rewardDescription || submission.rewardAmount
                        : formatCurrency(parseFloat(submission.rewardAmount))}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission)}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(submission.selectedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {submission.financeApprovalStatus !== 'approved' && submission.payoutStatus !== 'PAID' && (
                          <Button
                            size="sm"
                            onClick={() => financeApprovalMutation.mutate({ submissionId: submission.id, status: 'approved' })}
                            disabled={financeApprovalMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {canMarkAsPaid(submission) && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaidMutation.mutate(submission.id)}
                            disabled={markAsPaidMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-[#0F0F0F] border-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'approve' ? 'Approve Finance' : 'Mark as Paid'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {confirmDialog.action === 'approve'
                ? `You are about to approve ${confirmDialog.count} submission${confirmDialog.count !== 1 ? 's' : ''} for payment. This action cannot be undone.`
                : `You are about to mark ${confirmDialog.count} submission${confirmDialog.count !== 1 ? 's' : ''} as paid. This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, action: null, count: 0 })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.action === 'approve' ? handleBulkApprove : handleBulkMarkPaid}
              className={confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
