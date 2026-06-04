import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return data;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserOnboardingStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      profileExists: false,
      onboardingCompleted: false,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile,
    profileExists: Boolean(profile),
    onboardingCompleted: Boolean(profile?.onboarding_completed),
  };
}

export async function getCurrentAdminUser() {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("admin_users").select("user_id, role").eq("user_id", user.id).maybeSingle();

  return data;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data: adminUser } = await supabase.from("admin_users").select("user_id, role").eq("user_id", user.id).maybeSingle();

  if (!adminUser) {
    redirect("/radar");
  }

  return { user, adminUser };
}
