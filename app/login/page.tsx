import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">probe</CardTitle>
          <CardDescription>
            {hasClerk ? "Sign in to manage your conversational surveys." : "Demo client login for the MVP workspace."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasClerk ? (
            <SignIn fallbackRedirectUrl={next} signUpFallbackRedirectUrl={next} />
          ) : (
            <form action="/api/auth/login" method="post" className="grid gap-4">
              <input type="hidden" name="next" value={next} />
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue="founder@example.com" />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
