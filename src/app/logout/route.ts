import { logoutAction } from "@/lib/auth/actions";

export async function GET() {
  await logoutAction();
}
