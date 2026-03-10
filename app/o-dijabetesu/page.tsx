import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O dijabetesu",
  description:
    "Informacije o dijabetesu — tipovi, simptomi, ishrana, terapija i prevencija komplikacija.",
};

const sections = [
  {
    id: "sta-je",
    title: "Šta je dijabetes?",
    content: `Dijabetes melitus je hronična bolest koja nastaje kada pankreas ne proizvodi dovoljno insulina ili kada organizam ne može da koristi insulin koji proizvodi. Insulin je hormon koji reguliše nivo šećera (glukoze) u krvi. Nekontrolisani dijabetes dovodi do hiperlikemije (povišen šećer u krvi) što tokom vremena može ozbiljno oštetiti srce, krvne sudove, oči, bubrege i nerve.`,
  },
  {
    id: "tip-1",
    title: "Dijabetes tip 1",
    content: `Dijabetes tip 1 je autoimuna bolest u kojoj imunološki sistem napada ćelije pankreasa koje proizvode insulin. Osobe sa tipom 1 dijabetesa moraju svakodnevno primati insulin — injekcijama ili insulinskom pumpom. Dijabetes tip 1 se najčešće javlja u detinjstvu ili mladosti, ali može se pojaviti u bilo kom dobu.`,
  },
  {
    id: "tip-2",
    title: "Dijabetes tip 2",
    content: `Dijabetes tip 2 je najčešći oblik dijabetesa — čini oko 90% svih slučajeva. Nastaje kada ćelije postanu rezistentne na insulin ili kada pankreas ne može da proizvede dovoljno insulina. Na razvoj tipa 2 utiču genetika, prekomerna težina, fizička neaktivnost i starosna dob. Leči se promenom načina života, oralnim lekovima i/ili insulinom.`,
  },
  {
    id: "gestacijski",
    title: "Gestacijski dijabetes",
    content: `Gestacijski dijabetes se javlja tokom trudnoće i prolazi nakon porođaja. Može povećati rizik od komplikacija tokom trudnoće i porođaja, kao i od razvoja dijabetesa tipa 2 later u životu. Redovne provere tokom trudnoće su ključne za rano otkrivanje.`,
  },
  {
    id: "simptomi",
    title: "Simptomi dijabetesa",
    content: `Česti simptomi dijabetesa uključuju: pojačanu žeđ i učestalo mokrenje, umor i slabost, zamagljen vid, sporo zarastanje rana, trnce ili utrnulost u stopalima i šakama. Dijabetes tip 2 često nema simptoma u ranoj fazi — redovne provere šećera su ključne za rano otkrivanje.`,
  },
  {
    id: "ishrana",
    title: "Ishrana i dijabetes",
    content: `Pravilna ishrana je temelj upravljanja dijabetesom. Preporučuje se ishrana bogata povrćem, integralnim žitaricama, mahunarkim i zdravim mastima. Treba ograničiti konzumaciju šećera, belog brašna, prerađene hrane i gaziranih napitaka. Redovni obroci u isto vreme pomažu stabilizaciji šećera u krvi. Konsultujte se sa nutricionistom za personalizovani plan ishrane.`,
  },
  {
    id: "terapija",
    title: "Terapija i lekovi",
    content: `Lečenje dijabetesa zavisi od tipa i stadijuma bolesti. Uključuje: insulinsku terapiju (obavezna za tip 1, često i za tip 2), oralne antidijabetike (metformin, inhibitori SGLT-2, analozi GLP-1 i dr.), kontinuirano praćenje glikemije (glukometri, CGM senzori), kao i redovnu fizičku aktivnost. Redovne provere kod lekara su obavezne.`,
  },
];

export default function ODijabetesuPage() {
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
                        href={`/Diaverzum_sajt_mock/content/materijal/${encodeURIComponent(pdf.file)}`}
                        download={pdf.file}
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

            <div className="space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`heading-${section.id}`}
                  className="scroll-mt-24"
                >
                  <h2
                    id={`heading-${section.id}`}
                    className="text-xl font-bold text-brand-blue mb-4 pb-2 border-b border-brand-gray-mid"
                  >
                    {section.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </section>
              ))}
            </div>

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
