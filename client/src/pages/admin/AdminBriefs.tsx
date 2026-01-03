import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { MoreHorizontal, Plus, Search, Eye, Edit, Archive, ArrowUpRight, Building2, MapPin } from "lucide-react";
import { BUSINESS_LINES, STATES } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminBriefs } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function AdminBriefs() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [businessLineFilter, setBusinessLineFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Fetch briefs from API
  const { data: briefs = [], isLoading } = useQuery({
    queryKey: ["adminBriefs"],
    queryFn: fetchAdminBriefs,
  });

  const filteredBriefs = briefs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBusinessLine = businessLineFilter === "all" || (b as any).businessLine === businessLineFilter;
    const matchesState = stateFilter === "all" || (b as any).state === stateFilter;
    return matchesSearch && matchesBusinessLine && matchesState;
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-white">Briefs</h1>
          <p className="text-gray-400 mt-1">Manage your campaigns and bounties.</p>
        </div>
        <Link href="/admin/briefs/new">
          <Button className="gap-2 bg-[#7B5CFA] hover:bg-[#6B4EE6] text-black">
            <Plus className="h-4 w-4" />
            Create Brief
          </Button>
        </Link>
      </div>

      <Card className="bg-[#0F0F0F] border-[#1A1A1A]">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search briefs..." 
                className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={businessLineFilter} onValueChange={setBusinessLineFilter}>
                <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-white" data-testid="select-business-line">
                  <Building2 className="h-4 w-4 mr-2 text-[#7B5CFA]" />
                  <SelectValue placeholder="Business Line" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="all">All Lines</SelectItem>
                  {BUSINESS_LINES.map((line) => (
                    <SelectItem key={line} value={line}>{line}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-white" data-testid="select-state">
                  <MapPin className="h-4 w-4 mr-2 text-[#7B5CFA]" />
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="all">All States</SelectItem>
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Business Line</TableHead>
                <TableHead className="text-gray-400">State</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Bounty</TableHead>
                <TableHead className="text-gray-400">Deadline</TableHead>
                <TableHead className="text-center text-gray-400">Submissions</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBriefs.map((brief) => (
                <TableRow 
                  key={brief.id} 
                  className="cursor-pointer border-[#2A2A2A] hover:bg-[#1A1A1A]" 
                  onClick={() => setLocation(`/admin/briefs/${brief.id}`)}
                >
                  <TableCell className="font-medium text-white">
                    <div>{brief.title}</div>
                    <div className="text-xs text-gray-500 md:hidden">{brief.status}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#7B5CFA]/30 text-[#7B5CFA] bg-[#7B5CFA]/10">
                      {(brief as any).businessLine || "Sportsbook"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-400 text-sm">
                      {(brief as any).state || "Florida"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      brief.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20' : 
                      brief.status === 'DRAFT' ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/20' : ''
                    }>
                      {brief.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {brief.reward.type === 'OTHER' ? 'Gift' : formatCurrency(brief.reward.amount as number)}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(brief.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-[#2A2A2A] text-gray-300">
                      {brief.submissionCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                        <DropdownMenuItem onClick={() => setLocation(`/admin/briefs/${brief.id}`)} className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/b/${brief.slug}`)} className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">
                          <ArrowUpRight className="mr-2 h-4 w-4" /> View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-[#2A2A2A]">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBriefs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No briefs found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
