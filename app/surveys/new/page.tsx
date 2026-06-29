import { AppChrome } from "@/components/AppChrome";
import { CreateSurveyForm } from "@/components/CreateSurveyForm";

export default function NewSurveyPage() {
  return (
    <AppChrome>
      <section className="section">
        <h1>New conversational survey</h1>
        <p className="muted">Define the research objective. probe turns it into a structured SurveySpec.</p>
      </section>
      <section className="panel panel-pad">
        <CreateSurveyForm />
      </section>
    </AppChrome>
  );
}
