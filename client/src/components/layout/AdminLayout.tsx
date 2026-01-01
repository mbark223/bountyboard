import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Settings, LogOut, Plus, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/briefs", label: "Briefs", icon: FileText },
    { href: "/admin/influencers", label: "Influencers", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-sans">
      <aside className="w-64 bg-[#0F0F0F] border-r border-[#1A1A1A] fixed h-full z-40 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#1A1A1A]">
          <Link href="/" className="flex items-center gap-3">
            <img src="/hrb-logo.png" alt="Hard Rock Bet" className="h-10 w-10 rounded-lg" />
            <div className="flex flex-col">
              <span className="font-heading text-lg tracking-wider text-[#7B5CFA] leading-none">
                HARD ROCK BET
              </span>
              <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-6">
            <Link href="/admin/briefs/new">
              <Button 
                className="w-full justify-start gap-2 font-medium bg-[#7B5CFA] hover:bg-[#6B4EE6] text-black" 
                size="lg" 
                data-testid="button-new-brief"
              >
                <Plus className="h-4 w-4" />
                New Brief
              </Button>
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#7B5CFA]/10 text-[#7B5CFA]" 
                      : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-[#7B5CFA]" : "text-gray-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-[#1A1A1A] space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9 border-2 border-[#7B5CFA]/30">
                <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                <AvatarFallback className="bg-[#7B5CFA]/10 text-[#7B5CFA] text-sm">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                {user.orgName && (
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {user.orgName}
                  </p>
                )}
              </div>
            </div>
            <a 
              href="/api/logout" 
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </a>
          </div>
        )}
      </aside>

      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="md:hidden h-16 border-b border-[#1A1A1A] bg-[#0F0F0F] flex items-center justify-between px-4 sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <img src="/hrb-logo.png" alt="Hard Rock Bet" className="h-8 w-8 rounded-lg" />
            <span className="font-heading text-lg tracking-wider text-[#7B5CFA]">HARD ROCK BET</span>
          </Link>
          <Button variant="ghost" size="sm" className="text-gray-400">Menu</Button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
