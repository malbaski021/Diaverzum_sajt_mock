import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donacije",
  description:
    "Podržite rad udruženja Diaverzum Novi Sad — saznajte kako možete da donirate i pomognete osobama sa dijabetesom.",
};

const ways = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: "Uplata na račun",
    content: (
      <div className="space-y-2 text-sm text-gray-700">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-400">Naziv primaoca</span>
          <span className="font-medium">Diaverzum Novi Sad</span>
          <span className="text-gray-400">Banka</span>
          <span className="font-medium">Banka Intesa</span>
          <span className="text-gray-400">Broj računa</span>
          <span className="font-mono font-medium">160600000172623674</span>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Lična donacija",
    content: (
      <p className="text-sm text-gray-700 leading-relaxed">
        Možete nas posetiti lično (uz prethodnu najavu telefonom) u našim prostorijama na adresi{" "}
        <strong>Bulevar Oslobođenja 33, Novi Sad</strong> i predati donaciju direktno.
      </p>
    ),
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Donacija opreme i materijala",
    content: (
      <p className="text-sm text-gray-700 leading-relaxed">
        Prihvatamo donacije medicinskih pomagala, edukativnih materijala i
        opreme koja može pomoći našim članovima. Kontaktirajte nas da se
        dogovorimo o preuzimanju ili dostavi.
      </p>
    ),
  },
];

export default function DonacijePage() {
  return (
    <div className="section-padding">
      <div className="container-max">

        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Donacije</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white rounded-2xl p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
          <div className="relative z-10 max-w-xl">
            <h1 className="text-white mb-4">Podržite Diaverzum</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Svaka donacija direktno pomaže osobama sa dijabetesom u Novom
              Sadu — finansira edukacije, nabavku pomagala i organizaciju
              događaja koji menjaju živote.
            </p>
          </div>
        </div>

        {/* Why donate */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Zašto donirati?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "Edukacija", desc: "Finansiramo predavanja, radionice i edukativne materijale za pacijente i porodice." },
              { icon: "🩺", title: "Pomagala", desc: "Pomažemo nabavku glukometara, traka i insulinskih pumpi za članove koji to ne mogu sami." },
              { icon: "🤝", title: "Zajednica", desc: "Organizujemo susrete, grupe podrške i zajednička putovanja koja jačaju naše članove." },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <span className="text-4xl" role="img" aria-label={item.title}>{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to donate */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kako donirati?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ways.map((way) => (
              <div key={way.title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center mb-4">
                  {way.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{way.title}</h3>
                {way.content}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-brand-blue-light rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Imate pitanja?</h2>
            <p className="text-gray-600 text-sm">
              Kontaktirajte nas i rado ćemo vam pomoći oko donacije.
            </p>
          </div>
          <Link href="/kontakt" className="btn-primary whitespace-nowrap">
            Kontaktiraj nas
          </Link>
        </div>

      </div>
    </div>
  );
}
