"use client";

import { useEveAgent } from "eve/react";
import { CheckCircle2, Clock3, Loader2, SendHorizonal, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Turn = {
  id: string;
  role: "agent" | "respondent" | "system";
  content: string;
};

type PublicSurvey = {
  id: string;
  title: string;
  brand: string;
  estimatedMinutes: number;
  maxTurns: number;
  openingMessage: string;
};

export function RespondentChat({ token, survey }: { token: string; survey: PublicSurvey }) {
  const eveAgent = useEveAgent({
    headers: {
      "x-probe-survey-token": token,
      "x-probe-survey-id": survey.id,
    },
  });
  const [responseId, setResponseId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function start() {
      try {
        const response = await fetch(`/api/respond/${token}/start`, { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not start this response.");
        setResponseId(payload.response.id);
        setTurns(payload.turns);
      } catch (startError) {
        setError(startError instanceof Error ? startError.message : "Could not start this response.");
      } finally {
        setPending(false);
      }
    }
    start();
  }, [token]);

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function send(content = message) {
    if (!responseId || !content.trim() || pending || complete) return;
    setPending(true);
    setError(null);
    setMessage("");
    try {
      const response = await fetch(`/api/respond/${token}/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responseId, message: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save this answer.");
      setTurns((current) => [...current, ...payload.turns]);
      setProgress(payload.progress ?? progress);
      setComplete(payload.response.status === "completed");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not save this answer.");
      setMessage(content);
    } finally {
      setPending(false);
    }
  }

  return (
    <main
      className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background text-foreground"
      data-eve-status={eveAgent.status}
    >
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{survey.brand}</span>
              <Badge variant={complete ? "secondary" : "outline"} className="hidden sm:inline-flex">
                {complete ? "Completed" : "In progress"}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{survey.title}</p>
          </div>
          <div className="grid w-36 shrink-0 gap-1.5 sm:w-48">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" />
                {survey.estimatedMinutes} min
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} aria-label="Survey progress" />
          </div>
        </div>
      </header>

      <section className="overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
          {turns.map((turn) => {
            const isRespondent = turn.role === "respondent";
            return (
              <article
                className={cn("flex items-end gap-2", isRespondent ? "justify-end" : "justify-start")}
                key={turn.id}
              >
                {!isRespondent ? (
                  <div className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xs font-semibold text-secondary-foreground">
                    AI
                  </div>
                ) : null}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%]",
                    isRespondent
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-card-foreground"
                  )}
                >
                  {turn.content}
                </div>
              </article>
            );
          })}

          {pending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Thinking</span>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {complete ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              <CheckCircle2 className="size-4" />
              <span>Thanks, your response was saved.</span>
            </div>
          ) : null}

          <div ref={logRef} />
        </div>
      </section>

      <form
        className="border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div className="mx-auto grid w-full max-w-3xl gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => send("No se")} disabled={pending || complete}>
              No se
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => send("Saltar")} disabled={pending || complete}>
              Saltar
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => send("Terminar")} disabled={pending || complete}>
              Terminar
            </Button>
          </div>
          <div className="grid gap-2 rounded-3xl border bg-card p-2 shadow-sm sm:grid-cols-[1fr_auto]">
            <Textarea
              aria-label="Response"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={complete ? "Gracias por responder." : "Escribi una respuesta corta..."}
              disabled={pending || complete}
              className="min-h-14 border-transparent bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
            />
            <Button size="lg" type="submit" disabled={pending || complete || !message.trim()} className="self-end">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
              Send
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
