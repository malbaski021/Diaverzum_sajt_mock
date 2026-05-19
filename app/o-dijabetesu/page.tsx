import type { Metadata } from "next";
import Link from "next/link";
import { getDijabetesSections } from "@/lib/oDijabetesu";
import ExpandableSectionsList from "@/components/ExpandableSectionsList";

export const metadata: Metadata = {
  title: "O dijabetesu",
  description:
    "Informacije o dijabetesu — tipovi, simptomi, ishrana, terapija i prevencija komplikacija.",
};

export default function ODijabetesuPage() {
  const sections = getDijabetesSections();

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">O dijabetesu</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky sidebar nav */}
          <aside className="lg:col-span-1">
            <nav
              aria-label="Sadržaj stranice"
              className="sticky top-24 bg-white rounded-xl border border-brand-gray-mid p-4"
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Sadržaj
              </p>
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-sm text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>

              {/* PDF materijali */}
              <div className="mt-6 pt-4 border-t border-brand-gray-mid">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Materijali
                </p>
                <ul className="space-y-2">
                  {[
                    { label: "Ishrana", file: "Ishrana.pdf" },
                    { label: "Računanje ugljenih hidrata", file: "Racunanje ugljenih hidrata.pdf" },
                    { label: "Saveti o treningu", file: "Saveti o treningu.pdf" },
                  ].map((pdf) => (
                    <li key={pdf.file}>
                      <a
                        href={`/content/materijal/${encodeURIComponent(pdf.file)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-blue hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-blue-light transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {pdf.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            <h1 className="text-gray-900 mb-4">O dijabetesu</h1>
            <p className="text-xl text-gray-500 mb-12">
              Sve što treba da znate o dijabetesu — od osnova do upravljanja
              bolešću svakodnevno.
            </p>

            <ExpandableSectionsList sections={sections} />

            {/* Disclaimer */}
            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-sm text-yellow-800">
                <strong>Napomena:</strong> Informacije na ovoj stranici su
                edukativnog karaktera i ne zamenjuju savet lekara. Za sve
                zdravstvene odluke konsultujte svog lekara ili endokrinologa.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
