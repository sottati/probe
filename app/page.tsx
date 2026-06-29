import { LandingPage } from "@/components/LandingPage";
import { isAuthenticated } from "@/lib/session";

export default async function Page() {
  const authed = await isAuthenticated();
  return <LandingPage authed={authed} />;
}
