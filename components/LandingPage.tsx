"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Locale = "en" | "es";

const copy = {
  en: {
    signIn: "Sign in",
    dashboard: "Dashboard",
    tagline: "Conversational surveys guided by AI.",
    description:
      "Define what you want to learn. Share a link. Get structured research responses — without building another static form.",
    getStarted: "Get started",
    newSurvey: "New survey",
    openDashboard: "Open dashboard",
    features: [
      {
        label: "01",
        title: "Conversational",
        description: "AI-guided interviews that feel natural, not like a form.",
      },
      {
        label: "02",
        title: "Structured output",
        description: "Every response is extracted into fields you define upfront.",
      },
      {
        label: "03",
        title: "Share anywhere",
        description: "Publish a link. Respondents don't need an account.",
      },
    ],
    ctaPrompt: "Ready to run your first interview?",
    createSurvey: "Create a survey",
    signInToStart: "Sign in to start",
  },
  es: {
    signIn: "Iniciar sesión",
    dashboard: "Panel",
    tagline: "Encuestas conversacionales guiadas por IA.",
    description:
      "Define qué quieres aprender. Comparte un enlace. Obtén respuestas estructuradas — sin armar otro formulario estático.",
    getStarted: "Empezar",
    newSurvey: "Nueva encuesta",
    openDashboard: "Abrir panel",
    features: [
      {
        label: "01",
        title: "Conversacional",
        description: "Entrevistas guiadas por IA que se sienten naturales, no como un formulario.",
      },
      {
        label: "02",
        title: "Salida estructurada",
        description: "Cada respuesta se extrae en los campos que defines de antemano.",
      },
      {
        label: "03",
        title: "Comparte en cualquier lugar",
        description: "Publica un enlace. Los encuestados no necesitan cuenta.",
      },
    ],
    ctaPrompt: "¿Listo para tu primera entrevista?",
    createSurvey: "Crear encuesta",
    signInToStart: "Inicia sesión para comenzar",
  },
} as const;

function LocaleToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border p-0.5 text-xs">
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "rounded-md px-2 py-1 font-medium uppercase transition-colors",
            locale === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export function LandingPage({ authed }: { authed: boolean }) {
  const [locale, setLocale] = useState<Locale>("en");
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-medium tracking-tight">probe</span>
        <div className="flex items-center gap-3">
          <LocaleToggle locale={locale} onChange={setLocale} />
          <ThemeToggle />
          {authed ? (
            <Button size="sm" render={<Link href="/dashboard" />}>
              {t.dashboard}
            </Button>
          ) : (
            <Button size="sm" variant="outline" render={<Link href="/login" />}>
              {t.signIn}
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-24">
        <section className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">probe</h1>
          <p className="text-lg text-muted-foreground sm:text-xl">{t.tagline}</p>
          <p className="max-w-lg text-muted-foreground">{t.description}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button render={<Link href={authed ? "/surveys/new" : "/login?next=/surveys/new"} />}>
              {authed ? t.newSurvey : t.getStarted}
            </Button>
            {authed ? (
              <Button variant="outline" render={<Link href="/dashboard" />}>
                {t.openDashboard}
              </Button>
            ) : null}
          </div>
        </section>

        <section className="mt-24 space-y-10 border-t pt-16">
          {t.features.map((feature) => (
            <article key={feature.label} className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">{feature.label}</p>
              <h2 className="text-lg font-medium">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-24 border-t pt-16">
          <p className="text-sm text-muted-foreground">{t.ctaPrompt}</p>
          <Button className="mt-4" render={<Link href={authed ? "/surveys/new" : "/login"} />}>
            {authed ? t.createSurvey : t.signInToStart}
          </Button>
        </section>
      </div>
    </main>
  );
}
