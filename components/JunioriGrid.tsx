"use client";

import { useState } from "react";
import Link from "next/link";
import { JunioriPost } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Filter = "sve" | "video" | "gallery";

function TypeBadge({ type }: { type: "video" | "gallery" }) {
  if (type === "video") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Video
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-brand-blue-light text-brand-blue">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
      Galerija
    </span>
  );
}

function PostCard({ post }: { post: JunioriPost }) {
  return (
    <Link
      href={`/juniori/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-brand-gray-mid hover:border-brand-blue hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] bg-brand-blue-light overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${BASE}${post.coverImage}`}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-blue opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {/* Video play overlay */}
        {post.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#0056b3" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <TypeBadge type={post.type} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-gray-900 font-bold text-base leading-snug mb-2 group-hover:text-brand-blue transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-brand-gray-text leading-relaxed flex-1 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>{post.author}</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("sr-Latn-RS", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
      </div>
    </Link>
  );
}

export default function JunioriGrid({ posts }: { posts: JunioriPost[] }) {
  const [filter, setFilter] = useState<Filter>("sve");

  const filtered = posts.filter((p) => {
    if (filter === "sve") return true;
    return p.type === filter;
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: "sve", label: "Sve" },
    { id: "video", label: "Video" },
    { id: "gallery", label: "Galerije" },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-8" role="tablist" aria-label="Filter sadržaja">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
              filter === tab.id
                ? "bg-brand-blue text-white shadow-sm"
                : "bg-white text-gray-600 border border-brand-gray-mid hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-brand-gray-text text-center py-16">Nema sadržaja u ovoj kategoriji.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
