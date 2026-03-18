import type { Metadata } from "next";
import Link from "next/link";
import { getAllJunioriPosts } from "@/lib/juniori";
import JunioriGrid from "@/components/JunioriGrid";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Diaverzum Juniori",
  description:
    "Prostor za mlade sa dijabetesom — video, galerije i priče koje klinci prave sami.",
};

export default function JunioriPage() {
  const posts = getAllJunioriPosts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-blue to-[#003d80] text-white">
        <div className="container-max px-4 py-16 flex flex-col items-center text-center gap-6">
          <div style={{ height: "140px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/diaverzum-logo-juniors.png`}
              alt="Diaverzum Juniori"
              style={{ height: "320px", width: "auto", objectFit: "cover", flexShrink: 0 }}
            />
          </div>
          <div className="max-w-2xl">
            <p className="text-lg text-blue-100 leading-relaxed">
              Prostor za mlade sa dijabetesom. Ovde klinci prave sadržaj sami —
              video, recepti, priče i slike iz pravog života sa dijabetesom.
            </p>
          </div>
          <Link
            href="/kontakt"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-blue font-semibold text-sm hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Želi da učestvuješ?
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="section-padding">
        <div className="container-max px-4">
          {/* Breadcrumb */}
          <nav aria-label="Putanja" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-brand-blue">
                  Početna
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 font-medium" aria-current="page">
                Juniori
              </li>
            </ol>
          </nav>

          <JunioriGrid posts={posts} />
        </div>
      </div>
    </div>
  );
}
