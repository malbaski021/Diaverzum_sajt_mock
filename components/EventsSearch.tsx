"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import Link from "next/link";
import Img from "@/components/Img";
import { EventData } from "@/lib/events";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";

interface Props {
  events: EventData[];
}

export default function EventsSearch({ events }: Props) {
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
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query)
      )
    : events;

  return (
    <>
      {/* Search */}
      <div className="relative w-full sm:w-72">
        <label htmlFor="events-search" className="sr-only">Pretraži događaje</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          id="events-search"
          type="search"
          value={value}
          onChange={(e) => { setValue(e.target.value); handleSearch(e.target.value); }}
          placeholder="Pretraži događaje..."
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
          <p className="text-5xl mb-4" aria-hidden="true">📅</p>
          <p className="text-lg font-medium">{query ? "Nema rezultata" : "Događaji uskoro..."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filtered.map((event) => (
            <Link key={event.slug} href={`/dogadjaji/${event.slug}`} className="card overflow-hidden group">
              <div className="relative h-48 bg-brand-blue-light overflow-hidden">
                {event.images[0] ? (
                  <Img
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
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
              </div>
              <div className="p-5">
                <time dateTime={event.date} className="text-xs text-brand-gray-text uppercase tracking-wider">
                  {format(new Date(event.date), "d. MMMM yyyy.", { locale: srLatn })}
                </time>
                <h3 className="font-bold text-gray-900 mt-2 mb-2 group-hover:text-brand-blue transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">{event.content.split("\n")[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
