"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold">MyVirtualTutor</div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-neutral-200/20 px-4 py-2 text-sm"
            >
              Sign in
            </Link>
            <Link
              href="/login?callbackUrl=%2Fsession"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Start a session
            </Link>
          </nav>
        </header>

        <section className="mt-16 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Calm, step-by-step math tutoring.
            </h1>
            <p className="mt-4 text-base opacity-80">
              MyVirtualTutor helps students learn math with clear explanations,
              a simple whiteboard, and a focused tutoring flow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?callbackUrl=%2Fsession"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-medium text-black"
              >
                Start free session
              </Link>
              <Link
                href="/session"
                className="rounded-xl border border-neutral-200/20 px-5 py-3 text-center text-sm"
              >
                Go to session (if signed in)
              </Link>
            </div>

            <ul className="mt-10 space-y-3 text-sm opacity-85">
              <li>• Teaching-first: guided steps, not shortcuts.</li>
              <li>• Built-in whiteboard for working through problems.</li>
              <li>• Designed to feel safe, calm, and distraction-free.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-neutral-200/20 bg-white/5 p-6 shadow">
            <div className="text-sm font-medium">How it works</div>
            <ol className="mt-4 space-y-3 text-sm opacity-85">
              <li>
                <span className="font-medium">1)</span> Sign in with email.
              </li>
              <li>
                <span className="font-medium">2)</span> Start a session.
              </li>
              <li>
                <span className="font-medium">3)</span> Get step-by-step help on the board.
              </li>
            </ol>

            <div className="mt-6 rounded-2xl border border-neutral-200/20 bg-black/20 p-4">
              <div className="text-xs uppercase opacity-70">Tip</div>
              <div className="mt-1 text-sm">
                Try: “Solve 23 ÷ 4 and show the steps.”
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-20 border-t border-neutral-200/10 pt-8 text-xs opacity-70">
          © {new Date().getFullYear()} MyVirtualTutor. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
