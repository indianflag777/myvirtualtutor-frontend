"use client";

import Link from "next/link";

function LogoMark() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-extrabold">
      <div className="grid grid-cols-2 gap-x-1 gap-y-0 leading-none">
        <span>+</span>
        <span>−</span>
        <span>×</span>
        <span>÷</span>
      </div>
    </div>
  );
}

function HowStep({ number, title, desc }) {
  return (
    <div className="flex gap-5 rounded-2xl border-2 border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-extrabold">
        {number}
      </div>
      <div>
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <p className="mt-1.5 text-base text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoMark />
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
              MyVirtualTutor
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-semibold"
            >
              Sign in
            </Link>
            <Link
              href="/login?callbackUrl=%2Fsession"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700"
            >
              Start free session
            </Link>
          </nav>
        </header>

        {/* Hero + How it works */}
        <section className="mt-24 grid gap-16 md:grid-cols-2 md:items-start">
          {/* Left hero copy */}
          <div className="pt-2">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Calm, step-by-step
              <span className="text-blue-600"> math tutoring</span>.
            </h1>

            <p className="mt-7 text-xl text-slate-600">
              A focused AI tutor that teaches math visually, clearly, and without shortcuts —
              so students build real understanding and confidence.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login?callbackUrl=%2Fsession"
                className="rounded-xl bg-blue-600 px-7 py-3.5 text-center text-sm font-extrabold text-white hover:bg-blue-700"
              >
                Start a free session
              </Link>
              <Link
                href="/session"
                className="rounded-xl border-2 border-slate-300 px-7 py-3.5 text-center text-sm font-semibold"
              >
                Go to session
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Free to start • No credit card required
            </p>
          </div>

          {/* Right: Bigger, more visible How it works */}
          <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-10 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              How it works
            </div>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Three simple steps to start learning
            </h2>

            <div className="mt-8 space-y-5">
              <HowStep
                number="1"
                title="Sign in securely"
                desc="Sign in with a simple email link. No passwords to remember."
              />
              <HowStep
                number="2"
                title="Start a live session"
                desc="Begin instantly and ask a question your child is working on."
              />
              <HowStep
                number="3"
                title="Learn step-by-step on the board"
                desc="The tutor explains each step visually and checks understanding."
              />
            </div>

            <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Try asking
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                “Solve 23 ÷ 4 and explain every step.”
              </div>
            </div>
          </div>
        </section>

        {/* Black Section */}
        <section className="mt-28 rounded-3xl bg-black px-10 py-20 text-white">
          <h2 className="text-center text-4xl md:text-5xl font-extrabold">
            Built for understanding — not memorization
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-white/15 p-7">
              <div className="text-xl font-extrabold">Teaching-first</div>
              <p className="mt-3 text-base text-white/80">
                Students reason through problems instead of copying answers.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-white/15 p-7">
              <div className="text-xl font-extrabold">Visual whiteboard</div>
              <p className="mt-3 text-base text-white/80">
                Math is shown and explained visually, like real tutoring.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-white/15 p-7">
              <div className="text-xl font-extrabold">Grades 6–12</div>
              <p className="mt-3 text-base text-white/80">
                Focused specifically on middle and high school math.
              </p>
            </div>
          </div>
        </section>

        {/* Stronger Bottom CTA Section */}
        <section className="mt-28 rounded-3xl bg-blue-600 p-12 md:p-16 text-white">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Built for parents who want real learning.
              </h2>
              <p className="mt-6 text-lg text-white/90">
                A calm tutoring experience designed to help students understand math —
                and help parents feel confident about what’s happening.
              </p>

              <ul className="mt-8 space-y-3 text-base text-white/90">
                <li className="flex gap-3">
                  <span className="font-extrabold">✓</span>
                  Step-by-step teaching (not instant answers)
                </li>
                <li className="flex gap-3">
                  <span className="font-extrabold">✓</span>
                  Visual whiteboard for clarity
                </li>
                <li className="flex gap-3">
                  <span className="font-extrabold">✓</span>
                  Calm, distraction-free sessions
                </li>
              </ul>

              <Link
                href="/login?callbackUrl=%2Fsession"
                className="mt-10 inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-blue-700"
              >
                Start a free session
              </Link>
            </div>

            <div className="rounded-3xl bg-white/10 p-10 border-2 border-white/15">
              <div className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Parent reassurance
              </div>
              <div className="mt-4 text-2xl font-extrabold">
                “I want my child to understand, not memorize.”
              </div>
              <p className="mt-4 text-base text-white/85">
                MyVirtualTutor is built around explanation, check-ins, and a clean whiteboard flow —
                so learning feels structured and safe.
              </p>

              <div className="mt-8 rounded-2xl bg-black/20 p-5">
                <div className="text-xs uppercase tracking-wide text-white/70">
                  Great for
                </div>
                <div className="mt-2 text-base font-semibold">
                  Homework • Tests • Catching up • Staying ahead
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-28 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} MyVirtualTutor. Built for understanding.
        </footer>
      </div>
    </main>
  );
}
