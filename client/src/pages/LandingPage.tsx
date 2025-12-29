import { Button } from "@/components/ui/button";
import { Guitar, Users, Trophy, ArrowRight, DollarSign, Video, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1A1A1A]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
              <Guitar className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl tracking-wider text-[#D4AF37] leading-none">
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
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section className="py-20 md:py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-8">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-[#D4AF37] tracking-wide uppercase font-medium">Roll With Us</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 leading-none tracking-wide">
              CREATE LEGENDARY
              <br />
              <span className="text-gradient-gold">
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
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#C4A030] hover:to-[#E4C030] text-black text-lg px-8 font-semibold glow-gold"
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
            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#D4AF37]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Video className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3 tracking-wide">SUBMIT VIDEOS</h3>
              <p className="text-gray-500">
                Find briefs that match your style. Upload your best content and compete for rewards.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#D4AF37]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Users className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-heading text-white mb-3 tracking-wide">GET REVIEWED</h3>
              <p className="text-gray-500">
                Our team reviews every submission. Stand out with creative, on-brand content.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-8 text-center hover:border-[#D4AF37]/50 transition-colors group">
              <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <DollarSign className="w-8 h-8 text-[#D4AF37]" />
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
            className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-10 md:p-16"
          >
            <Guitar className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
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
                className="bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold px-10"
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
              <div className="h-8 w-8 rounded bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                <Guitar className="h-4 w-4 text-black" />
              </div>
              <span className="font-heading text-lg tracking-wider text-[#D4AF37]">
                HARD ROCK BET
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://www.hardrock.bet/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                Hard Rock Bet
              </a>
              <a href="https://www.hardrock.bet/sportsbook" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                Sportsbook
              </a>
              <a href="https://www.hardrock.bet/casino" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
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
