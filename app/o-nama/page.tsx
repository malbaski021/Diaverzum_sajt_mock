import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O nama",
  description:
    "Saznajte više o udruženju Diaverzum Novi Sad — ko smo, šta radimo i zašto postojimo.",
};

export default function ONamaPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">O nama</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-gray-900 mb-4">O nama</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Diaverzum Novi Sad je udruženje obolelih od dijabetesa koje od
            svog osnivanja pruža podršku, edukaciju i zajednicu svim osobama sa
            dijabetesom u Novom Sadu i okolini.
          </p>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-brand-blue-light rounded-xl p-8">
            <h2 className="text-xl font-bold text-brand-blue mb-3">Naša misija</h2>
            <p className="text-gray-700 leading-relaxed">
              Pružamo podršku, edukaciju i zajednicu svim osobama sa
              dijabetesom, pomažući im da žive punovredno i zdravo. Verujemo
              da informisanost i solidarnost su temelji kvalitetnog života sa
              dijabetesom.
            </p>
          </div>
          <div className="bg-brand-blue-light rounded-xl p-8">
            <h2 className="text-xl font-bold text-brand-blue mb-3">Naša vizija</h2>
            <p className="text-gray-700 leading-relaxed">
              Svet u kome svaka osoba sa dijabetesom ima pristup svim
              informacijama, lekovima i podršci koji su joj potrebni za
              dostojanstven i zdrav život.
          </p>
          </div>
        </div>

        {/* What we do */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Šta radimo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "Edukacija", desc: "Organizujemo predavanja, radionice i edukativne kampanje za pacijente i porodice." },
              { icon: "🏥", title: "Podrška", desc: "Pružamo podršku novoobolelima, pomažemo u navigaciji kroz zdravstveni sistem." },
              { icon: "🤝", title: "Zajednica", desc: "Organizujemo susrete, grupe podrške i zajednička putovanja za naše članove." },
              { icon: "📢", title: "Zastupanje", desc: "Zagovaramo prava pacijenata i bolji pristup lekovima i medicinskim pomagalima." },
              { icon: "🌐", title: "Onlajn resursi", desc: "Delimo proverene informacije o dijabetesu na srpskom jeziku." },
              { icon: "🩺", title: "Preventiva", desc: "Organizujemo besplatne preglede i edukacije o prevenciji komplikacija." },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <span className="text-3xl" role="img" aria-label={item.title}>{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-blue text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Pridruži nam se</h2>
          <p className="text-blue-100 mb-6">
            Postani deo naše zajednice i dobij pristup svim programima i
            aktivnostima.
          </p>
          <Link href="/kontakt" className="bg-white text-brand-blue font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-block">
            Kontaktiraj nas
          </Link>
        </div>
      </div>
    </div>
  );
}
