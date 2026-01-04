import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { fetchBriefs } from "@/lib/api";
import { transformBrief } from "@/lib/transformers";
import { formatCurrency } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Gift, 
  Clock, 
  Video, 
  ArrowRight,
  Filter,
  Loader2,
  Building2,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function BriefsListPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: briefsData, isLoading, error } = useQuery({
    queryKey: ["briefs"],
    queryFn: fetchBriefs,
  });

  const briefs = briefsData?.map(transformBrief) || [];
  
  const activeBriefs = briefs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.orgName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-heading font-semibold flex items-center gap-2">
            Active Briefs 
            {!isLoading && <Badge variant="secondary" className="rounded-full ml-2">{activeBriefs.length}</Badge>}
          </h2>
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <h3 className="text-lg font-medium mb-2 text-destructive">Failed to load briefs</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : activeBriefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBriefs.map((brief, index) => (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/b/${brief.slug}`} className="block h-full group" data-testid={`card-brief-${brief.id}`}>
                  <Card className="h-full flex flex-col border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden bg-card">
                    <CardHeader className="pb-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="font-medium text-xs uppercase tracking-wider bg-secondary/50">
                            {brief.orgName}
                          </Badge>
                          {brief.reward.type === 'CASH' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Cash
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                              <Gift className="h-3 w-3 mr-1" />
                              Product
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-heading font-bold leading-tight group-hover:text-primary transition-colors">
                          {brief.title}
                        </h3>
                      </CardHeader>
                      
                      <CardContent className="flex-1 pb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                          {brief.overview}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-foreground/80">
                            <div className="w-8 flex justify-center shrink-0">
                              {brief.reward.type === 'OTHER' ? (
                                <Gift className="h-4 w-4 text-purple-500" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <span className="font-bold">
                              {brief.reward.type === 'OTHER' 
                                ? brief.reward.amount 
                                : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                            </span>
                            <span className="text-muted-foreground ml-1 font-normal">
                              Bounty
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-foreground/80">
                            <div className="w-8 flex justify-center shrink-0">
                              <Video className="h-4 w-4 text-blue-500" />
                            </div>
                            <span>{brief.deliverables.format} • {brief.deliverables.length}</span>
                          </div>

                          <div className="flex items-center text-sm text-foreground/80">
                            <div className="w-8 flex justify-center shrink-0">
                              <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                            <span>Due {new Date(brief.deadline).toLocaleDateString()}</span>
                          </div>

                          {brief.maxWinners && brief.maxWinners > 1 && (
                            <div className="flex items-center text-sm text-foreground/80">
                              <div className="w-8 flex justify-center shrink-0">
                                <Users className="h-4 w-4 text-indigo-500" />
                              </div>
                              <span>Up to {brief.maxWinners} winners</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 pb-5 px-6">
                        <div className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md text-center font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center">
                          View Details 
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardFooter>
                    </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <h3 className="text-lg font-medium mb-2">No active briefs found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "Check back later for new opportunities."}
            </p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
