"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [callbackUrl, setCallbackUrl] = useState("/session");

  useEffect(() => {
    // Client-only: avoids Next's Suspense requirement for useSearchParams.
    try {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb) setCallbackUrl(cb);
    } catch {
      // ignore and keep default
    }
  }, []);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("email", {
      email,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    setSent(!res?.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/20 bg-white/5 backdrop-blur p-6 shadow">
        <h1 className="text-2xl font-semibold">MyVirtualTutor</h1>
        <p className="mt-2 text-sm opacity-80">Sign in to start your session.</p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-neutral-200/20 p-4">
            <p className="text-sm">Check your email for a sign-in link.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <label className="block text-sm opacity-80">Email</label>
            <input
              className="w-full rounded-xl bg-black/20 border border-neutral-200/20 px-3 py-2 outline-none"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-white text-black font-medium py-2 disabled:opacity-50"
              type="submit"
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
