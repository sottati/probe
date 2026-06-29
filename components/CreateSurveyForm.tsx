"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateSurveyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch("/api/surveys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not create survey. Check the fields and try again.");
      return;
    }
    router.push(`/surveys/${payload.survey.id}`);
  }

  return (
    <form className="grid grid-2" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="title">Survey name</label>
        <input id="title" name="title" defaultValue="Trial activation interview" required />
      </div>
      <div className="field">
        <label htmlFor="brand">Brand</label>
        <input id="brand" name="brand" defaultValue="Beacon" required />
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label htmlFor="goal">What do you want to learn?</label>
        <textarea
          id="goal"
          name="goal"
          defaultValue="understand why trial users did not activate the Team Dashboard feature"
          required
        />
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label htmlFor="audience">Audience</label>
        <input id="audience" name="audience" defaultValue="B2B SaaS trial users" required />
      </div>
      <div className="field">
        <label htmlFor="mustCaptureText">Required fields</label>
        <textarea
          id="mustCaptureText"
          name="mustCaptureText"
          defaultValue={[
            "Respondent role",
            "Intended use case",
            "Activation blocker",
            "Moment of friction",
            "Current alternative",
            "Reactivation trigger",
          ].join("\n")}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="optionalProbesText">Optional probes</label>
        <textarea id="optionalProbesText" name="optionalProbesText" defaultValue={"Stakeholders\nUrgency"} />
      </div>
      <div className="field">
        <label htmlFor="estimatedMinutes">Duration</label>
        <select id="estimatedMinutes" name="estimatedMinutes" defaultValue="5">
          <option value="3">3 minutes</option>
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="tone">Tone</label>
        <select id="tone" name="tone" defaultValue="professional">
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="direct">Direct</option>
          <option value="warm">Warm</option>
        </select>
      </div>
      <input type="hidden" name="monthlyBudgetUsd" value="25" />
      {error ? <p style={{ color: "var(--danger)", gridColumn: "1 / -1" }}>{error}</p> : null}
      <div style={{ gridColumn: "1 / -1" }}>
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create preview"}
        </button>
      </div>
    </form>
  );
}
