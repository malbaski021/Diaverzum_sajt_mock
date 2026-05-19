const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="bg-gray-900 text-gray-300">
      <div className="container-max px-4 py-16">
        <div className="flex flex-col items-start gap-6">
          <div style={{ height: "110px", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/diaverzum-logo-footer.png`}
              alt="Diaverzum Novi Sad"
              style={{ height: "160px", width: "auto", objectFit: "contain", marginTop: "-25px" }}
            />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Diaverzum Novi Sad je udruženje koje pruža podršku, edukaciju i
            zajednicu svim osobama sa dijabetesom i njihovim porodicama u
            Novom Sadu i okolini.
          </p>
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
