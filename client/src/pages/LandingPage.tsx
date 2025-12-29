import { Button } from "@/components/ui/button";
import { Users, ArrowRight, DollarSign, Video, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1A1A1A]">
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
              className="border-[#7B5CFA] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-black transition-colors"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section className="py-20 md:py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7B5CFA]/5 to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-[#7B5CFA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B5CFA]/10 border border-[#7B5CFA]/30 mb-8">
              <Star className="w-4 h-4 text-[#7B5CFA]" />
              <span className="text-sm text-[#7B5CFA] tracking-wide uppercase font-medium">Roll With Us</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 leading-none tracking-wide">
              CREATE LEGENDARY
              <br />
              <span className="text-gradient-purple">
                CONTENT
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Submit your best videos for a chance to win cash, bonus bets, and exclusive rewards.
              The stage is set. Are you ready?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/api/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#7B5CFA] to-[#9B7DFF] hover:from-[#6B4EE6] hover:to-[#8B6DFF] text-black text-lg px-8 font-semibold glow-purple"
                  data-testid="button-get-started"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-lg px-8"
                  data-testid="button-browse-briefs"
                >
                  Browse Briefs
                </Button>
              </a>
            </div>
          </motion.div>
        </section>

        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#7B5CFA]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#7B5CFA]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#7B5CFA]/20 transition-colors">
                <Video className="w-8 h-8 text-[#7B5CFA]" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3 tracking-wide">SUBMIT VIDEOS</h3>
              <p className="text-gray-500">
                Find briefs that match your style. Upload your best content and compete for rewards.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#7B5CFA]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#7B5CFA]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#7B5CFA]/20 transition-colors">
                <Users className="w-8 h-8 text-[#7B5CFA]" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3 tracking-wide">GET REVIEWED</h3>
              <p className="text-gray-500">
                Our team reviews every submission. Stand out with creative, on-brand content.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#7B5CFA]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#7B5CFA]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#7B5CFA]/20 transition-colors">
                <DollarSign className="w-8 h-8 text-[#7B5CFA]" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3 tracking-wide">WIN REWARDS</h3>
              <p className="text-gray-500">
                Get paid in cash, bonus bets, or exclusive Hard Rock rewards. Multiple winners per brief.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-[#7B5CFA]/10 via-[#7B5CFA]/5 to-[#7B5CFA]/10 border border-[#7B5CFA]/30 rounded-2xl p-10 md:p-16"
          >
            <img src="/hrb-logo.png" alt="Hard Rock Bet" className="w-16 h-16 rounded-xl mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-4 tracking-wide">
              THE SPORTSBOOK FOR EVERY KIND OF CREATOR
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Hard Rock Bet has remixed the bounty experience. Create content, earn rewards, 
              and be part of the legendary Hard Rock family.
            </p>
            <a href="/api/login">
              <Button 
                size="lg" 
                className="bg-[#7B5CFA] hover:bg-[#6B4EE6] text-black font-semibold px-10"
              >
                Join the Stage
              </Button>
            </a>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-[#1A1A1A] py-8 mt-8">
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
