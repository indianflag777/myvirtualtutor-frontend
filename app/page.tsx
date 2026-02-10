'use client';
import { useEffect } from 'react';
import Hero from './components/Hero';
import FeatureCard from './components/FeatureCard';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineBook } from 'react-icons/ai';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  }, []);

  return (
    <main>
      <Hero />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<AiOutlineCheckCircle size={40} />}
          title="Math-only Focus"
          description="No distractions, no social features, pure math tutoring."
        />
        <FeatureCard
          icon={<AiOutlineClockCircle size={40} />}
          title="Step-by-Step Guidance"
          description="Every solution explained patiently and clearly."
        />
        <FeatureCard
          icon={<AiOutlineBook size={40} />}
          title="Grades 6–12"
          description="Curriculum aligned for middle and high school students."
        />
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
