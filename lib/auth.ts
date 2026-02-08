import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "./prisma";

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    EmailProvider({
      // IMPORTANT: do not read/validate env here (build-time). Keep it runtime-only.
      from: getEnv("EMAIL_FROM") || "MyVirtualTutor <onboarding@resend.dev>",

      async sendVerificationRequest({ identifier, url, provider }) {
        const apiKey = getEnv("RESEND_API_KEY");
        const from = (provider.from as string) || "MyVirtualTutor <onboarding@resend.dev>";

        if (!apiKey) {
          console.error("[auth] Missing RESEND_API_KEY at runtime");
          throw new Error("Missing RESEND_API_KEY");
        }

        const resend = new Resend(apiKey);

        await resend.emails.send({
          from,
          to: identifier,
          subject: "Sign in to MyVirtualTutor",
          text: `Sign in to MyVirtualTutor:\n\n${url}\n\nIf you did not request this email, you can ignore it.`,
        });
      },
    }),
  ],

  session: { strategy: "database" },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

