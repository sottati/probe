"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublishButton({ surveyId }: { surveyId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function publish() {
    setPending(true);
    await fetch(`/api/surveys/${surveyId}/publish`, { method: "POST" });
    setPending(false);
    router.refresh();
  }

  return (
    <button className="button primary" onClick={publish} disabled={pending}>
      {pending ? "Publishing..." : "Publish"}
    </button>
  );
}
