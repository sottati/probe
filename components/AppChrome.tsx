import { readDb } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export async function AppChrome({ children }: { children: React.ReactNode }) {
  const db = await readDb();
  const surveys = db.surveys.map((survey) => ({
    id: survey.id,
    title: survey.title,
    status: survey.status,
  }));

  return <AppShell surveys={surveys}>{children}</AppShell>;
}
