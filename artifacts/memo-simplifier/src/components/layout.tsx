import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/briefly_logo_transparent.png";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/new", label: "New memo", icon: FileText },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <img src={logoUrl} alt="Briefly" className="h-6 brightness-0 invert" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/new" && location.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 text-xs text-sidebar-foreground/40 font-medium tracking-wide">
          Briefly Legal Systems
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        <div className="flex-1 h-full overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
