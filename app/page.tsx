import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/session";

const features = [
  {
    label: "01",
    title: "Conversational",
    description: "AI-guided interviews that feel natural, not like a form.",
  },
  {
    label: "02",
    title: "Structured output",
    description: "Every response is extracted into fields you define upfront.",
  },
  {
    label: "03",
    title: "Share anywhere",
    description: "Publish a link. Respondents don't need an account.",
  },
] as const;

export default async function LandingPage() {
  const authed = await isAuthenticated();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-medium tracking-tight">probe</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {authed ? (
            <Button size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          ) : (
            <Button size="sm" variant="outline" render={<Link href="/login" />}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-24">
        <section className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">probe</h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Conversational surveys guided by AI.
          </p>
          <p className="max-w-lg text-muted-foreground">
            Define what you want to learn. Share a link. Get structured research responses — without
            building another static form.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button render={<Link href={authed ? "/surveys/new" : "/login?next=/surveys/new"} />}>
              {authed ? "New survey" : "Get started"}
            </Button>
            {authed ? (
              <Button variant="outline" render={<Link href="/dashboard" />}>
                Open dashboard
              </Button>
            ) : null}
          </div>
        </section>

        <section className="mt-24 space-y-10 border-t pt-16">
          {features.map((feature) => (
            <article key={feature.label} className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">{feature.label}</p>
              <h2 className="text-lg font-medium">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-24 border-t pt-16">
          <p className="text-sm text-muted-foreground">
            Ready to run your first interview?
          </p>
          <Button className="mt-4" render={<Link href={authed ? "/surveys/new" : "/login"} />}>
            {authed ? "Create a survey" : "Sign in to start"}
          </Button>
        </section>
      </div>
    </main>
  );
}
