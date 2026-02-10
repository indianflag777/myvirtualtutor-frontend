import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

/**
 * Server-side route protection for App Router.
 * Use inside server components/layouts/pages.
 *
 * @param callbackPath - the path to return to after login (e.g. "/session", "/whiteboard")
 */
export async function requireAuth(callbackPath: string = "/session") {
  const session = await getServerSession(authOptions);

  if (!session) {
    const encoded = encodeURIComponent(callbackPath);
    redirect(`/login?callbackUrl=${encoded}`);
  }

  return session;
}
