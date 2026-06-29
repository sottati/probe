import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            probe
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/" />}>
              Dashboard
            </Button>
            <Button size="sm" render={<Link href="/surveys/new" />}>
              New survey
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
