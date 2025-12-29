import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchBriefs } from "@/lib/api";
import { transformBrief } from "@/lib/transformers";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  DollarSign, 
  Gift, 
  Clock, 
  Video, 
  ArrowRight,
  Loader2,
  Building2,
  Users,
  Zap,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: briefsData, isLoading } = useQuery({
    queryKey: ["briefs"],
    queryFn: fetchBriefs,
  });

  const briefs = briefsData?.map(transformBrief) || [];
  
  const activeBriefs = briefs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.orgName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0B14]">
      <header className="border-b border-[#1A1525] sticky top-0 z-50 bg-[#0D0B14]/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/hrb-logo.png" alt="Hard Rock Bet" className="w-10 h-10 rounded-lg" />
            <div className="flex flex-col">
              <span className="font-heading text-2xl tracking-wider text-[#7B5CFA] leading-none">
                HARD ROCK BET
              </span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                Creator Portal
              </span>
            </div>
          </div>
          <a href="/api/login">
            <Button 
              variant="outline" 
              className="border-[#7B5CFA] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-white transition-colors"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main>
        <section className="py-12 md:py-16 relative overflow-hidden border-b border-[#1A1525]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7B5CFA]/5 to-transparent pointer-events-none" />
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-[#7B5CFA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-[#9B7DFF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-heading text-white mb-4 leading-none tracking-wide">
                AVAILABLE <span className="text-[#7B5CFA]">BOUNTIES</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
                Create content for Hard Rock Bet and earn cash, bonus bets, and exclusive rewards.
              </p>
              
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input 
                  className="pl-12 h-12 text-base bg-[#1A1525] border-[#2A2535] text-white placeholder:text-gray-500 focus:border-[#7B5CFA]" 
                  placeholder="Search bounties..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-8 border-b border-[#1A1525] bg-[#0D0B14]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-xl bg-[#1A1525]/50">
                <Zap className="w-6 h-6 text-[#7B5CFA] mx-auto mb-2" />
                <div className="text-xl font-heading text-white">{activeBriefs.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Active Bounties</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#1A1525]/50">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl font-heading text-white">
                  {formatCurrency(activeBriefs.reduce((sum, b) => sum + (typeof b.reward.amount === 'number' ? b.reward.amount : 0), 0))}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Rewards</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#1A1525]/50">
                <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-xl font-heading text-white">
                  {activeBriefs.reduce((sum, b) => sum + (b.maxWinners || 1), 0)}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Winner Spots</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#7B5CFA]" />
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
                  <Link href={`/b/${brief.slug}`}>
                    <a className="block h-full group" data-testid={`card-brief-${brief.id}`}>
                      <Card className="h-full flex flex-col bg-[#1A1525] border-[#2A2535] hover:border-[#7B5CFA]/50 transition-all duration-300 overflow-hidden">
                        <CardHeader className="pb-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {brief.organization?.logoUrl ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={brief.organization.logoUrl} alt={brief.orgName} />
                                  <AvatarFallback className="bg-[#7B5CFA]/20 text-[#7B5CFA] text-xs">
                                    {brief.orgName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-[#7B5CFA]/20 flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-[#7B5CFA]" />
                                </div>
                              )}
                              <Badge variant="outline" className="font-medium text-xs uppercase tracking-wider bg-[#2A2535] border-[#3A3545] text-gray-300">
                                {brief.orgName}
                              </Badge>
                            </div>
                            {brief.reward.type === 'CASH' ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Cash
                              </Badge>
                            ) : brief.reward.type === 'BONUS_BETS' ? (
                              <Badge className="bg-[#7B5CFA]/20 text-[#9B7DFF] border-[#7B5CFA]/30">
                                <Zap className="h-3 w-3 mr-1" />
                                Bonus Bets
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Gift className="h-3 w-3 mr-1" />
                                Product
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-heading font-bold leading-tight text-white group-hover:text-[#7B5CFA] transition-colors">
                            {brief.title}
                          </h3>
                        </CardHeader>
                        
                        <CardContent className="flex-1 pb-4">
                          <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                            {brief.overview}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-300">
                              <div className="w-8 flex justify-center shrink-0">
                                {brief.reward.type === 'OTHER' ? (
                                  <Gift className="h-4 w-4 text-amber-400" />
                                ) : (
                                  <DollarSign className="h-4 w-4 text-green-400" />
                                )}
                              </div>
                              <span className="font-bold text-white">
                                {brief.reward.type === 'OTHER' 
                                  ? brief.reward.amount 
                                  : formatCurrency(brief.reward.amount as number, brief.reward.currency)}
                              </span>
                              <span className="text-gray-500 ml-1 font-normal">
                                per video
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-300">
                              <div className="w-8 flex justify-center shrink-0">
                                <Video className="h-4 w-4 text-[#7B5CFA]" />
                              </div>
                              <span>{brief.deliverables.format} • {brief.deliverables.length}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-300">
                              <div className="w-8 flex justify-center shrink-0">
                                <Clock className="h-4 w-4 text-orange-400" />
                              </div>
                              <span>Due {new Date(brief.deadline).toLocaleDateString()}</span>
                            </div>

                            {brief.maxWinners && brief.maxWinners > 1 && (
                              <div className="flex items-center text-sm text-gray-300">
                                <div className="w-8 flex justify-center shrink-0">
                                  <Users className="h-4 w-4 text-[#9B7DFF]" />
                                </div>
                                <span>Up to {brief.maxWinners} winners</span>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-0 pb-5 px-6">
                          <Button className="w-full bg-[#7B5CFA] hover:bg-[#6B4EE6] text-white transition-colors">
                            View Bounty 
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </a>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#1A1525] rounded-xl border border-dashed border-[#2A2535]">
              <Trophy className="w-12 h-12 text-[#7B5CFA]/50 mx-auto mb-4" />
              <h3 className="text-lg font-heading text-white mb-2">No Bounties Available</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search." : "Check back soon for new opportunities."}
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#1A1525] py-8 bg-[#0D0B14]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/hrb-logo.png" alt="Hard Rock Bet" className="h-8 w-8 rounded-lg" />
              <span className="font-heading text-lg tracking-wider text-[#7B5CFA]">
                HARD ROCK BET
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://www.hardrock.bet/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7B5CFA] transition-colors">
                Hard Rock Bet
              </a>
              <a href="https://www.hardrock.bet/sportsbook" target="_blank" rel="noopener noreferrer" className="hover:text-[#7B5CFA] transition-colors">
                Sportsbook
              </a>
              <a href="https://www.hardrock.bet/casino" target="_blank" rel="noopener noreferrer" className="hover:text-[#7B5CFA] transition-colors">
                Casino
              </a>
            </div>
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Hard Rock Bet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
