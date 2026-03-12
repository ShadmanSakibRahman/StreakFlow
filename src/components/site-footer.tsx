export function SiteFooter() {
  return (
    <footer className="border-t py-4 text-center text-xs text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>StreakFlow — Build better habits, one day at a time.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Md. Shadman Sakib Rahman. All rights reserved.</p>
      </div>
    </footer>
  );
}
