import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-navy text-white relative">
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left: Logo placeholder + Headline + CTA */}
        <div className="flex-1 space-y-6">
          {/* Logo placeholder */}
          <div className="w-36 h-12 bg-accent-blue rounded fade-in mb-6"></div>

          {/* Headline with brand color */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight fade-in text-accent-blue">
            Calm, step-by-step math help—anytime
          </h1>
          <p className="text-lg max-w-lg fade-in text-mint">
            MyVirtualTutor is a focused AI math tutor that explains clearly,
            writes on a whiteboard, and never rushes your child.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 mt-4 fade-in">
            <button className="bg-gradient-to-r from-accent-blue to-mint hover:from-mint hover:to-accent-blue text-white font-semibold px-6 py-3 rounded-lg transition-all duration-500 shadow-md hover:shadow-xl">
              Start Free Session
            </button>
            <button className="border border-text-secondary text-text-secondary hover:bg-slate hover:text-white px-6 py-3 rounded-lg transition">
              See How It Works
            </button>
          </div>
        </div>

        {/* Right: Whiteboard Preview */}
        <div className="flex-1 relative w-full h-96 md:h-[28rem] float-animation fade-in">
          <Image
            src="/images/whiteboard-preview.png"
            alt="Whiteboard Preview"
            fill
            className="object-contain rounded-xl shadow-lg"
          />
        </div>

      </div>
    </section>
  );
}
