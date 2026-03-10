import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white overflow-hidden"
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3"
        aria-hidden="true"
      />

      <div className="container-max px-4 py-24 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span
              className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"
              aria-hidden="true"
            />
            Udruženje dijabetičara Novi Sad
          </div>

          <h1 id="hero-heading" className="text-5xl font-bold leading-tight mb-6">
            Dobra edukacija<br />
            <span className="text-blue-200">za život bez komplikacija</span>
          </h1>

          <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-xl">
            Diaverzum Novi Sad je udruženje koje pruža podršku, edukaciju i
            zajednicu svim osobama sa dijabetesom i njihovim porodicama u
            Novom Sadu i okolini.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/o-nama" className="btn-primary bg-white text-brand-blue hover:bg-blue-50">
              Saznaj više o nama
            </Link>
            <Link
              href="/o-dijabetesu"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              O dijabetesu
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
