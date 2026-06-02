import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/lib/auth";

export default async function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const { user, onboardingCompleted } = await getUserOnboardingStatus();

  if (!user) {
    redirect("/login");
  }

  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  return children;
}
