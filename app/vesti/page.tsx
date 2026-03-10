import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllArticles } from "@/lib/mdx";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Vesti",
  description:
    "Najnovije vesti iz udruženja Diaverzum Novi Sad i sveta dijabetesa.",
};

interface Props {
  searchParams: { q?: string };
}

export default function VestiPage({ searchParams }: Props) {
  const allArticles = getAllArticles("vesti");
  const query = searchParams.q?.toLowerCase() ?? "";

  const filtered = query
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      )
    : allArticles;

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Vesti</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-gray-900">Vesti</h1>
          <div className="w-full sm:w-72">
            <Suspense>
              <SearchBar placeholder="Pretraži vesti..." />
            </Suspense>
          </div>
        </div>

        {query && (
          <p className="text-gray-500 mb-6 text-sm">
            {filtered.length > 0
              ? `${filtered.length} rezultat(a) za "${searchParams.q}"`
              : `Nema rezultata za "${searchParams.q}"`}
          </p>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} section="vesti" />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4" aria-hidden="true">📭</p>
            <p className="text-lg font-medium">
              {query ? "Nema rezultata" : "Vesti uskoro..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
