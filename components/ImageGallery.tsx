"use client";

import { useState, useEffect, useCallback } from "react";
import Img from "@/components/Img";

interface Props {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = () => setLightbox(null);

  const prev = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (!images.length) return null;

  return (
    <>
      {/* Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        role="list"
        aria-label="Galerija fotografija"
      >
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setLightbox(i)}
            className="relative aspect-square rounded-lg overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-label={`Otvori fotografiju ${i + 1} od ${images.length}: ${title}`}
            role="listitem"
          >
            <Img
              src={src}
              alt={`${title} — fotografija ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotografija ${lightbox + 1} od ${images.length}`}
          onClick={close}
        >
          {/* Image container */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[80vh]">
              <Img
                src={images[lightbox]}
                alt={`${title} — fotografija ${lightbox + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Counter */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              {lightbox + 1} / {images.length}
            </p>
          </div>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Prethodna fotografija"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Sledeća fotografija"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Zatvori galeriju"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
