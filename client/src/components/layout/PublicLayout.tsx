import { Link } from "wouter";
import logo from '@assets/generated_images/minimalist_geometric_logo_for_bountyboard_app.png';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="BountyBoard Logo" 
              className="h-8 w-8 rounded-lg group-hover:scale-105 transition-transform duration-300" 
            />
            <span className="font-heading font-bold text-xl tracking-tight text-foreground">
              BountyBoard
            </span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="py-8 border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 BountyBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
