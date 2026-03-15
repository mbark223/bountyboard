import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Video,
  Shield,
  TrendingUp,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
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
          <Link href="/login">
            <Button
              variant="outline"
              className="border-[#7B5CFA] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-white transition-colors"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden border-b border-[#1A1525]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7B5CFA]/5 to-transparent pointer-events-none" />
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-[#7B5CFA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-[#9B7DFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-6xl font-heading text-white mb-6 leading-tight tracking-wide">
                WELCOME TO THE<br />
                <span className="text-[#7B5CFA]">HARD ROCK BET</span><br />
                CREATOR PORTAL
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                Create content, earn rewards, and partner with one of the biggest names in sports betting and entertainment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login?type=admin">
                  <Button
                    size="lg"
                    className="w-64 bg-[#7B5CFA] hover:bg-[#6B4EE6] text-white text-lg h-14 font-medium transition-all hover:scale-105"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Login
                  </Button>
                </Link>
                <Link href="/login?type=influencer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-64 border-[#7B5CFA] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-white text-lg h-14 font-medium transition-all hover:scale-105"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Influencer Portal
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-[#0D0B14] border-b border-[#1A1525]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="bg-[#1A1525] border-[#2A2535] p-6 text-center hover:border-[#7B5CFA]/50 transition-colors">
                  <Video className="w-12 h-12 text-[#7B5CFA] mx-auto mb-4" />
                  <h3 className="text-lg font-heading text-white mb-2">Create Content</h3>
                  <p className="text-sm text-gray-400">
                    Submit engaging videos that showcase your creativity and connect with audiences.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="bg-[#1A1525] border-[#2A2535] p-6 text-center hover:border-[#7B5CFA]/50 transition-colors">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-heading text-white mb-2">Earn Rewards</h3>
                  <p className="text-sm text-gray-400">
                    Get paid with cash, bonus bets, and exclusive perks for your best work.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="bg-[#1A1525] border-[#2A2535] p-6 text-center hover:border-[#7B5CFA]/50 transition-colors">
                  <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-heading text-white mb-2">Brand Partnerships</h3>
                  <p className="text-sm text-gray-400">
                    Partner with Hard Rock Bet and access exclusive collaboration opportunities.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="bg-[#1A1525] border-[#2A2535] p-6 text-center hover:border-[#7B5CFA]/50 transition-colors">
                  <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-heading text-white mb-2">Track Performance</h3>
                  <p className="text-sm text-gray-400">
                    Monitor your submissions, earnings, and performance metrics in real-time.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
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
