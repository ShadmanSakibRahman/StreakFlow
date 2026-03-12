"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/habits", label: "Habits" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

function UserInitial({
  photoURL,
  displayName,
  size = "md",
}: {
  photoURL?: string | null | undefined;
  displayName?: string | null | undefined;
  size?: "sm" | "md" | undefined;
}) {
  const cls = size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs";
  return (
    <div
      className={cn(
        "rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium overflow-hidden flex-shrink-0",
        cls
      )}
    >
      {photoURL ? (
        <img
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        displayName?.charAt(0)?.toUpperCase() || "?"
      )}
    </div>
  );
}

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StreakFlow
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <UserInitial
                    photoURL={user.photoURL}
                    displayName={user.displayName}
                    size="md"
                  />
                  <span className="text-sm text-muted-foreground hidden lg:inline">
                    {user.displayName?.split(" ")[0]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut()}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <UserInitial
                  photoURL={user.photoURL}
                  displayName={user.displayName}
                  size="sm"
                />
                <span className="text-sm">{user.displayName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
