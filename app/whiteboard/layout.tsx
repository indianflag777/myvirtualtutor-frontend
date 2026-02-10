import { requireAuth } from "../../lib/require-auth";

export default async function WhiteboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/whiteboard");
  return <>{children}</>;
}
