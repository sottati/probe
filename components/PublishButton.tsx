"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <Button onClick={publish} disabled={pending}>
      {pending ? "Publishing..." : "Publish"}
    </Button>
  );
}
