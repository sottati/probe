import Link from "next/link";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          probe
        </Link>
        <nav className="nav">
          <Link className="button" href="/">
            Dashboard
          </Link>
          <Link className="button primary" href="/surveys/new">
            New survey
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="button" type="submit">
              Logout
            </button>
          </form>
        </nav>
      </header>
      <div className="container">{children}</div>
    </main>
  );
}
