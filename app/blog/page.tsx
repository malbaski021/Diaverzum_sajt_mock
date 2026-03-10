import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllArticles } from "@/lib/mdx";
import { getAllEvents } from "@/lib/events";
import BlogSearch from "@/components/BlogSearch";

export const metadata: Metadata = {
  title: "Blog",
  description: "Događaji, edukativni tekstovi i iskustva naših članova — Diaverzum Novi Sad.",
};

export default function BlogPage() {
  const allArticles = getAllArticles("blog");
  const allEvents = getAllEvents();

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
        </div>

        <Suspense>
          <BlogSearch articles={allArticles} events={allEvents} />
        </Suspense>
      </div>
    </div>
  );
}
