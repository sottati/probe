import { notFound } from "next/navigation";
import { RespondentChat } from "@/components/RespondentChat";
import { getSurveyByToken } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RespondentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const survey = await getSurveyByToken(token);
  if (!survey) notFound();

  return (
    <RespondentChat
      token={token}
      survey={{
        id: survey.id,
        title: survey.title,
        brand: survey.spec.brand,
        estimatedMinutes: survey.spec.estimatedMinutes,
        maxTurns: survey.spec.maxTurns,
        openingMessage: survey.spec.openingMessage,
      }}
    />
  );
}
