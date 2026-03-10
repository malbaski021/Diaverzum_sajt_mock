import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllArticles } from "@/lib/mdx";
import ArticleSearch from "@/components/ArticleSearch";

export const metadata: Metadata = {
  title: "Vesti",
  description: "Najnovije vesti iz udruženja Diaverzum Novi Sad i sveta dijabetesa.",
};

export default function VestiPage() {
  const allArticles = getAllArticles("vesti");

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

        <h1 className="text-gray-900 mb-8">Vesti</h1>

        <Suspense>
          <ArticleSearch articles={allArticles} section="vesti" placeholder="Pretraži vesti..." />
        </Suspense>
      </div>
    </div>
  );
}
