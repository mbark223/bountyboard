import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MOCK_BRIEFS } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { MoreHorizontal, Plus, Search, Eye, Edit, Archive, ArrowUpRight } from "lucide-react";

export default function AdminBriefs() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBriefs = MOCK_BRIEFS.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Briefs</h1>
          <p className="text-muted-foreground mt-1">Manage your campaigns and bounties.</p>
        </div>
        <Link href="/admin/briefs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Brief
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search briefs..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bounty</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-center">Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBriefs.map((brief) => (
                <TableRow key={brief.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setLocation(`/admin/briefs/${brief.id}`)}>
                  <TableCell className="font-medium">
                    <div>{brief.title}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{brief.status}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      brief.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                      brief.status === 'DRAFT' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' : ''
                    }>
                      {brief.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {brief.reward.type === 'OTHER' ? 'Gift' : formatCurrency(brief.reward.amount as number)}
                  </TableCell>
                  <TableCell>
                    {new Date(brief.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="ml-auto">
                      {brief.submissionCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/admin/briefs/${brief.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/b/${brief.slug}`)}>
                          <ArrowUpRight className="mr-2 h-4 w-4" /> View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
