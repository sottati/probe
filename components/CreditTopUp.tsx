"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreditTopUp() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function topUp() {
    setPending(true);
    await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amountUsd: 10, reason: "manual pilot top-up" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button className="button" type="button" onClick={topUp} disabled={pending}>
      {pending ? "Adding..." : "Add $10 pilot credits"}
    </button>
  );
}
