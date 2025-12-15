import { Link, useLocation } from "wouter";
import logo from '@assets/generated_images/minimalist_geometric_logo_for_bountyboard_app.png';
import { LayoutDashboard, FileText, Settings, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/briefs", label: "Briefs", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex font-sans">
      {/* Sidebar */}
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
              <Button className="w-full justify-start gap-2 shadow-sm font-medium" size="lg">
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
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header (visible only on small screens) */}
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
