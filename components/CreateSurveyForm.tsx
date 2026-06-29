"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateSurveyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState("5");
  const [tone, setTone] = useState("professional");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      ...Object.fromEntries(form.entries()),
      estimatedMinutes,
      tone,
    };
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
    <form className="grid gap-6 sm:grid-cols-2" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="title">Survey name</Label>
        <Input id="title" name="title" defaultValue="Trial activation interview" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" defaultValue="Beacon" required />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="goal">What do you want to learn?</Label>
        <Textarea
          id="goal"
          name="goal"
          defaultValue="understand why trial users did not activate the Team Dashboard feature"
          required
        />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="audience">Audience</Label>
        <Input id="audience" name="audience" defaultValue="B2B SaaS trial users" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mustCaptureText">Required fields</Label>
        <Textarea
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
      <div className="grid gap-2">
        <Label htmlFor="optionalProbesText">Optional probes</Label>
        <Textarea id="optionalProbesText" name="optionalProbesText" defaultValue={"Stakeholders\nUrgency"} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="estimatedMinutes">Duration</Label>
        <Select
          value={estimatedMinutes}
          onValueChange={(value) => value && setEstimatedMinutes(value)}
        >
          <SelectTrigger id="estimatedMinutes" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 minutes</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tone">Tone</Label>
        <Select value={tone} onValueChange={(value) => value && setTone(value)}>
          <SelectTrigger id="tone" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <input type="hidden" name="monthlyBudgetUsd" value="25" />
      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create preview"}
        </Button>
      </div>
    </form>
  );
}
