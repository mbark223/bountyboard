import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Guitar } from "lucide-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border/40 bg-[#0A0A0A] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Guitar className="h-6 w-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl tracking-wider text-[#D4AF37] leading-none">
                BOUNTY BOARD
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                by Hard Rock Bet
              </span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9 border-2 border-[#D4AF37]/50">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-border">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-foreground">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center gap-2 text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href="/api/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 bg-gradient-hrb">
        {children}
      </main>

      <footer className="py-8 border-t border-border/40 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                <Guitar className="h-4 w-4 text-black" />
              </div>
              <span className="font-heading text-lg tracking-wider text-[#D4AF37]">
                BOUNTY BOARD
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              &copy; 2025 Hard Rock Bet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
