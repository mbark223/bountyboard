import { Link, useLocation } from "wouter";
import logo from '@assets/generated_images/minimalist_geometric_logo_for_bountyboard_app.png';
import { LayoutDashboard, FileText, Settings, LogOut, Plus, Building2 } from "lucide-react";
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
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex font-sans">
      <aside className="w-64 bg-card border-r border-border fixed h-full z-40 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-7 w-7 rounded-md" />
            <span className="font-heading font-bold text-lg">BountyBoard</span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-6">
            <Link href="/admin/briefs/new">
              <Button className="w-full justify-start gap-2 shadow-sm font-medium" size="lg" data-testid="button-new-brief">
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
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                {user.orgName && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {user.orgName}
                  </p>
                )}
              </div>
            </div>
            <a 
              href="/api/logout" 
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </a>
          </div>
        )}
      </aside>

      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 w-6" />
            <span className="font-heading font-bold">BountyBoard</span>
          </Link>
          <Button variant="ghost" size="sm">Menu</Button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
