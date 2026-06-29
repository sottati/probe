import { SignIn } from "@clerk/nextjs";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="shell" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <section className="panel panel-pad" style={{ width: "min(420px, 100%)" }}>
        <h1>probe</h1>
        {hasClerk ? (
          <SignIn fallbackRedirectUrl={next} signUpFallbackRedirectUrl={next} />
        ) : (
          <>
            <p className="muted">Demo client login for the MVP workspace.</p>
            <form action="/api/auth/login" method="post" className="grid">
              <input type="hidden" name="next" value={next} />
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" defaultValue="founder@example.com" />
              </div>
              <button className="button primary" type="submit">
                Continue
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
