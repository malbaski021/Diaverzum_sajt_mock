"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Img from "@/components/Img";
import { ArticleMeta } from "@/types";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

interface Props {
  articles: ArticleMeta[];
}

export default function NewsSlider({ articles }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = articles.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count);
  }, [count]);

  const prev = () => setCurrent((c) => (c - 1 + count) % count);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, count]);

  if (!articles.length) return null;

  const article = articles[current];

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-brand-gray-mid"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Najnovije vesti"
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Vest {current + 1} od {count}: {article.title}
      </div>

      {/* Image */}
      <div className="relative h-56 bg-brand-blue-light">
        {article.image ? (
          <Img
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <NewsBluePlaceholder />
          </div>
        )}
        {/* Slide counter */}
        <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {count}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <time
          dateTime={article.date}
          className="text-xs text-brand-gray-text font-medium uppercase tracking-wider"
        >
          {format(new Date(article.date), "d. MMMM yyyy.", { locale: sr })}
        </time>
        <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
        <Link
          href={`/vesti/${article.slug}`}
          className="inline-flex items-center gap-1 text-brand-blue font-semibold text-sm mt-4 hover:underline"
        >
          Pročitaj više
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Idi na vest ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-brand-blue"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Prethodna vest"
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue flex items-center justify-center transition-colors text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Sledeća vest"
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue flex items-center justify-center transition-colors text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsBluePlaceholder() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" stroke="#0056b3" strokeWidth="3" fill="none" opacity="0.3" />
      <circle cx="40" cy="40" r="24" stroke="#0056b3" strokeWidth="2" fill="none" opacity="0.2" />
      <path d="M32 40h16M40 32v16" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
