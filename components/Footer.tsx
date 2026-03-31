const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const partners = [
  { src: "/content/partneri/bpi.jpg",                  alt: "BPI",                        scale: 1.6 },
  { src: "/content/partneri/idf.jpg",                  alt: "IDF",                        scale: 1.4 },
  { src: "/content/partneri/plavi-krug.png",           alt: "Plavi krug",                 scale: 1   },
  { src: "/content/partneri/savez.png",                alt: "Dijabetološki savez Srbije", scale: 2.1 },
  { src: "/content/partneri/novonordisk.jpg",          alt: "Novo Nordisk",               scale: 1.2 },
  { src: "/content/partneri/axiomq.jpg",               alt: "Axiomq",                     scale: 1.2 },
  { src: "/content/partneri/barrycalebaut.jpg",        alt: "Barry Callebaut",            scale: 1.2 },
  { src: "/content/partneri/ebers.jpg",                alt: "Ebers",                      scale: 1.6 },
  { src: "/content/partneri/nurdor.jpg",               alt: "Nurdor",                     scale: 1.2 },
  { src: "/content/partneri/rtv.jpg",                  alt: "RTV",                        scale: 1.2 },
  { src: "/content/partneri/pozoriste-mladih.jpg",     alt: "Pozorište mladih",           scale: 1.2 },
  { src: "/content/partneri/stetoskop.jpg",            alt: "Stetoskop",                  scale: 1.2 },
  { src: "/content/partneri/vodickrozdijabetes.jpg",   alt: "Vodič kroz dijabetes",       scale: 1.2 },
  { src: "/content/partneri/diabetno1.jpg",            alt: "Diabetno1",                  scale: 1.2 },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="bg-gray-900 text-gray-300">
      <div className="container-max px-4 py-16">
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          {/* Left — logo, opis, socijalne mreže */}
          <div className="flex flex-col items-start gap-6">
            <div style={{ height: "110px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/diaverzum-logo-footer.png`}
                alt="Diaverzum Novi Sad"
                style={{ height: "160px", width: "auto", objectFit: "contain", marginTop: "-25px" }}
              />
            </div>
            <div className="text-gray-400 text-sm leading-relaxed max-w-sm space-y-1">
              <p className="font-semibold text-gray-300 uppercase tracking-wide text-xs">Udruženje osoba sa dijabetesom &bdquo;Diaverzum&ldquo;</p>
              <p>Bulevar Oslobođenja 33, 21000 Novi Sad</p>
              <p>Račun 160-6000001726236-74 kod Banca Intesa</p>
              <p>PIB: 113746240 &nbsp;·&nbsp; Matični: 28362196</p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook stranica Diaverzuma (otvara se u novom tabu)"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-blue flex items-center justify-center transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram profil Diaverzuma (otvara se u novom tabu)"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-blue flex items-center justify-center transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/diaverzum/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (otvara se u novom tabu)"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-blue flex items-center justify-center transition-colors"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.youtube.com/@Diaverzum"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube (otvara se u novom tabu)"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-blue flex items-center justify-center transition-colors"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>

          {/* Right — saradnici */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Saradnici</p>
            <div className="grid grid-cols-5 gap-3">
              {partners.map((p) => (
                <div key={p.alt} className="bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden" style={{ width: "88px", height: "52px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${BASE}${p.src}`} alt={p.alt} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: `scale(${p.scale})` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {currentYear} Diaverzum Novi Sad. Sva prava zadržana.</p>
          <p>
            Svetski dan dijabetesa:{" "}
            <span className="text-brand-blue font-medium">14. novembar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}
