import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "./prisma";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    EmailProvider({
      from: mustGetEnv("EMAIL_FROM"),

      async sendVerificationRequest({ identifier, url, provider }) {
        const resend = new Resend(mustGetEnv("RESEND_API_KEY"));

        await resend.emails.send({
          from: provider.from as string,
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

