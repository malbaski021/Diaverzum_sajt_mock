"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArticleMeta } from "@/types";
import { EventData } from "@/lib/events";
import ArticleCard from "@/components/ArticleCard";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

interface Props {
  articles: ArticleMeta[];
  events: EventData[];
}

export default function BlogSearch({ articles, events }: Props) {
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

  const filteredArticles = query
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query)
      )
    : articles;

  const filteredEvents = query
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query)
      )
    : events;

  const totalCount = filteredArticles.length + filteredEvents.length;

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
          {totalCount > 0 ? `${totalCount} rezultat(a) za "${query}"` : `Nema rezultata za "${query}"`}
        </p>
      )}

      {totalCount === 0 ? (
        <div className="text-center py-24 text-gray-400 mt-6">
          <p className="text-5xl mb-4" aria-hidden="true">✍️</p>
          <p className="text-lg font-medium">{query ? "Nema rezultata" : "Blog tekstovi uskoro..."}</p>
        </div>
      ) : (
        <>
          {filteredEvents.length > 0 && (
            <section aria-labelledby="events-heading" className="mt-8 mb-12">
              <h2 id="events-heading" className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-mid">
                Događaji
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Link key={event.slug} href={`/blog/${event.slug}`} className="card overflow-hidden group">
                    <div className="relative h-48 bg-brand-blue-light overflow-hidden">
                      {event.images[0] ? (
                        <Image
                          src={event.images[0]}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl opacity-20">📸</span>
                        </div>
                      )}
                      {event.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                          📸 {event.images.length}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-brand-blue text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Događaj
                      </div>
                    </div>
                    <div className="p-5">
                      <time dateTime={event.date} className="text-xs text-brand-gray-text uppercase tracking-wider">
                        {format(new Date(event.date), "d. MMMM yyyy.", { locale: sr })}
                      </time>
                      <h3 className="font-bold text-gray-900 mt-2 mb-2 group-hover:text-brand-blue transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{event.content.split("\n")[0]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredArticles.length > 0 && (
            <section aria-labelledby="articles-heading">
              <h2 id="articles-heading" className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-mid">
                Tekstovi
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} section="blog" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
