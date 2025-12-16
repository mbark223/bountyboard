import { Button } from "@/components/ui/button";
import { Zap, Users, Trophy, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-outfit">BountyBoard</span>
          </div>
          <a href="/api/login">
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section className="py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-outfit mb-6 leading-tight">
            Launch Creative Campaigns.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Reward Great Content.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Post briefs with bounties. Creators submit content. You pick the winners. 
            Simple, transparent, and rewarding for everyone.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/api/login">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-lg px-8"
                data-testid="button-get-started"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-slate-200 hover:bg-slate-800 text-lg px-8"
                data-testid="button-browse-briefs"
              >
                Browse Briefs
              </Button>
            </a>
          </div>
        </section>

        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 font-outfit">Post Bounties</h3>
            <p className="text-slate-400">
              Create briefs with cash, bonus bets, or product rewards. Set your requirements and deadlines.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 font-outfit">Collect Submissions</h3>
            <p className="text-slate-400">
              Creators submit up to 3 entries per brief. Review submissions with your team.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 font-outfit">Pick Winners</h3>
            <p className="text-slate-400">
              Select multiple winners per brief. Track payouts and manage your creative campaigns.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} BountyBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
