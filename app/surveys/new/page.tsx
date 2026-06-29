import { AppChrome } from "@/components/AppChrome";
import { CreateSurveyForm } from "@/components/CreateSurveyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSurveyPage() {
  return (
    <AppChrome>
      <section className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">New conversational survey</h1>
        <p className="text-muted-foreground">
          Define the research objective. probe turns it into a structured SurveySpec.
        </p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Survey details</CardTitle>
          <CardDescription>Describe what you want to learn and who you want to hear from.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSurveyForm />
        </CardContent>
      </Card>
    </AppChrome>
  );
}
