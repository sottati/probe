"use client";

import { useEveAgent } from "eve/react";
import { ArrowUp, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

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

  const isBusy = pending && turns.length > 0;

  return (
    <MessageScrollerProvider>
      <main
        className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background text-foreground"
        data-eve-status={eveAgent.status}
      >
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
            <div className="flex items-center gap-3">
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
              <ThemeToggle />
            </div>
          </div>
        </header>

        <MessageScroller className="min-h-0">
          <MessageScrollerViewport>
            <MessageScrollerContent
              aria-busy={isBusy}
              className="mx-auto w-full max-w-3xl gap-4 px-4 py-6 sm:px-6"
            >
              {turns.map((turn) => {
                if (turn.role === "system") {
                  return (
                    <MessageScrollerItem key={turn.id}>
                      <Marker variant="separator">
                        <MarkerContent>{turn.content}</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  );
                }

                const isRespondent = turn.role === "respondent";
                return (
                  <MessageScrollerItem key={turn.id} scrollAnchor={isRespondent}>
                    <Message align={isRespondent ? "end" : "start"}>
                      {!isRespondent ? (
                        <MessageAvatar>
                          <Avatar size="sm">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                      ) : null}
                      <MessageContent>
                        <Bubble variant={isRespondent ? "default" : "outline"} align={isRespondent ? "end" : "start"}>
                          <BubbleContent>{turn.content}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}

              {pending && turns.length > 0 ? (
                <MessageScrollerItem>
                  <Marker>
                    <MarkerIcon>
                      <Loader2 className="size-4 animate-spin" />
                    </MarkerIcon>
                    <MarkerContent className="shimmer">Thinking&hellip;</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ) : null}

              {error ? (
                <MessageScrollerItem>
                  <Marker variant="border" className="text-destructive">
                    <MarkerIcon>
                      <XCircle className="size-4" />
                    </MarkerIcon>
                    <MarkerContent>{error}</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ) : null}

              {complete ? (
                <MessageScrollerItem>
                  <Marker variant="border">
                    <MarkerIcon>
                      <CheckCircle2 className="size-4" />
                    </MarkerIcon>
                    <MarkerContent>Thanks, your response was saved.</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>

        <form
          className="border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6"
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
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => send("Terminar")}
                disabled={pending || complete}
              >
                Terminar
              </Button>
            </div>
            <InputGroup className="h-auto rounded-3xl bg-card shadow-sm">
              <InputGroupTextarea
                aria-label="Response"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={complete ? "Gracias por responder." : "Escribi una respuesta corta..."}
                disabled={pending || complete}
                className="min-h-14 px-3 py-2.5"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
              />
              <InputGroupAddon align="block-end" className="justify-end px-2 pb-2">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={pending || complete || !message.trim()}
                  aria-label="Send message"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </form>
      </main>
    </MessageScrollerProvider>
  );
}
