import { requireAuth } from "../../lib/require-auth";

export default async function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/session");
  return <>{children}</>;
}
