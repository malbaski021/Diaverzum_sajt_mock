"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import { ArticleMeta } from "@/types";
import ArticleCard from "@/components/ArticleCard";

interface Props {
  articles: ArticleMeta[];
}

export default function BlogSearch({ articles }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("q", term);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const query = (searchParams.get("q") ?? "").toLowerCase();

  const filtered = query
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query)
      )
    : articles;

  return (
    <>
      {/* Search */}
      <div className="relative w-full sm:w-72">
        <label htmlFor="blog-search" className="sr-only">Pretraži blog</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          id="blog-search"
          type="search"
          value={value}
          onChange={(e) => { setValue(e.target.value); handleSearch(e.target.value); }}
          placeholder="Pretraži blog..."
          className="w-full pl-10 pr-4 py-2.5 border border-brand-gray-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
      </div>

      {query && (
        <p className="text-gray-500 mt-4 text-sm">
          {filtered.length > 0 ? `${filtered.length} rezultat(a) za "${query}"` : `Nema rezultata za "${query}"`}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 mt-6">
          <p className="text-5xl mb-4" aria-hidden="true">✍️</p>
          <p className="text-lg font-medium">{query ? "Nema rezultata" : "Blog tekstovi uskoro..."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} section="blog" />
          ))}
        </div>
      )}
    </>
  );
}
