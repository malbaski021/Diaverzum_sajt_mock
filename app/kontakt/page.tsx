import type { Metadata } from "next";
import Link from "next/link";
import KontaktForma from "@/components/KontaktForma";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktirajte udruženje Diaverzum Novi Sad — adresa, telefon i lokacija.",
};

const contactInfo = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Telefon",
    value: "+381 63 570 251",
    href: "tel:+38163570251",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "diaverzum.ns@gmail.com",
    href: "mailto:diaverzum.ns@gmail.com",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Adresa",
    value: "Bulevar Oslobođenja 33, 21000 Novi Sad",
    href: "https://maps.google.com/?q=Novi+Sad",
  },
];

export default function KontaktPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Kontakt</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Info */}
          <div>
            <h1 className="text-gray-900 mb-4">Kontakt</h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-3">
              Tu smo za vas. Javite nam se telefonom, emailom ili nas posetite
              lično u našim prostorijama u Novom Sadu.
            </p>
            <p className="text-sm text-gray-400 mb-10">
              Za ličnu posetu molimo vas da se unapred najavite telefonskim putem.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-gray-800 font-medium hover:text-brand-blue transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-800 font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-10 pt-8 border-t border-brand-gray-mid">
              <p className="text-sm font-semibold text-gray-600 mb-4">
                Pratite nas
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100093902550265"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook (otvara se u novom tabu)"
                  className="flex items-center gap-2 bg-[#1877f2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/diaverzum_ns/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (otvara se u novom tabu)"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/company/diaverzum/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (otvara se u novom tabu)"
                  className="flex items-center gap-2 bg-[#0a66c2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://www.youtube.com/@Diaverzum"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube (otvara se u novom tabu)"
                  className="flex items-center gap-2 bg-[#ff0000] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                  </svg>
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div>
            <div className="rounded-xl overflow-hidden border border-brand-gray-mid h-64 md:h-96 bg-brand-blue-light">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d237.3220567366564!2d19.832934298352253!3d45.260528613656895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b111c48efece5%3A0xccafa18b2bd441b0!2sDiaverzum!5e0!3m2!1sen!2srs!4v1773146028451!5m2!1sen!2srs"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokacija Diaverzum Novi Sad na mapi"
                aria-label="Google mapa — lokacija Diaverzum Novi Sad"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              📍 Bulevar Oslobođenja 33, 21000 Novi Sad
            </p>
          </div>
        </div>
        <KontaktForma />
      </div>
    </div>
  );
}
