"use client";

import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Props {
  images: string[];
  title: string;
}

export default function JunioriGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  function prev() {
    setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }

  function next() {
    setLightbox((i) => (i !== null ? (i + 1) % images.length : null));
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setLightbox(i)}
            className="relative aspect-square rounded-xl overflow-hidden bg-brand-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue group"
            aria-label={`Otvori sliku ${i + 1} od ${images.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}${src}`}
              alt={`${title} — slika ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Pregled slike"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-2"
            onClick={() => setLightbox(null)}
            aria-label="Zatvori"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-2"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Prethodna slika"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}${images[lightbox]}`}
              alt={`${title} — slika ${lightbox + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-white/50 text-sm text-center mt-3">
              {lightbox + 1} / {images.length}
            </p>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-2"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Sledeća slika"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
