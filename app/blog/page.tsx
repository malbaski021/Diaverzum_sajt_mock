import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getAllArticles } from "@/lib/mdx";
import { getAllEvents } from "@/lib/events";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Događaji, edukativni tekstovi i iskustva naših članova — Diaverzum Novi Sad.",
};

interface Props {
  searchParams: { q?: string };
}

export default function BlogPage({ searchParams }: Props) {
  const allArticles = getAllArticles("blog");
  const allEvents = getAllEvents();
  const query = searchParams.q?.toLowerCase() ?? "";

  const filteredArticles = query
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query)
      )
    : allArticles;

  const filteredEvents = query
    ? allEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query)
      )
    : allEvents;

  const totalCount = filteredArticles.length + filteredEvents.length;

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Blog</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-gray-900">Blog</h1>
            <p className="text-gray-500 mt-2">Događaji, iskustva i edukativni tekstovi</p>
          </div>
          <div className="w-full sm:w-72">
            <Suspense>
              <SearchBar placeholder="Pretraži blog..." />
            </Suspense>
          </div>
        </div>

        {query && (
          <p className="text-gray-500 mb-6 text-sm">
            {totalCount > 0
              ? `${totalCount} rezultat(a) za "${searchParams.q}"`
              : `Nema rezultata za "${searchParams.q}"`}
          </p>
        )}

        {totalCount === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4" aria-hidden="true">✍️</p>
            <p className="text-lg font-medium">
              {query ? "Nema rezultata" : "Blog tekstovi uskoro..."}
            </p>
          </div>
        ) : (
          <>
            {/* Events section */}
            {filteredEvents.length > 0 && (
              <section aria-labelledby="events-heading" className="mb-12">
                <h2 id="events-heading" className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6 pb-2 border-b border-brand-gray-mid">
                  Događaji
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <Link
                      key={event.slug}
                      href={`/blog/${event.slug}`}
                      className="card overflow-hidden group"
                    >
                      {/* Thumbnail — first image */}
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
                        {/* Image count badge */}
                        {event.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                            📸 {event.images.length}
                          </div>
                        )}
                        {/* Event badge */}
                        <div className="absolute top-2 left-2 bg-brand-blue text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          Događaj
                        </div>
                      </div>

                      <div className="p-5">
                        <time
                          dateTime={event.date}
                          className="text-xs text-brand-gray-text uppercase tracking-wider"
                        >
                          {format(new Date(event.date), "d. MMMM yyyy.", { locale: sr })}
                        </time>
                        <h3 className="font-bold text-gray-900 mt-2 mb-2 group-hover:text-brand-blue transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {event.content.split("\n")[0]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Articles section */}
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
      </div>
    </div>
  );
}
