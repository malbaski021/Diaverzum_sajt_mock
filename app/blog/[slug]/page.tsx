import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getAllSlugs } from "@/lib/mdx";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs("blog").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getArticleBySlug("blog", params.slug);
  if (!data) return {};
  return { title: data.meta.title, description: data.meta.excerpt };
}

export default function BlogSlugPage({ params }: Props) {
  const data = getArticleBySlug("blog", params.slug);
  if (!data) return notFound();

  const { meta, content } = data;

  return (
    <div className="section-padding">
      <div className="container-max">
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-brand-blue">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium line-clamp-1 max-w-xs" aria-current="page">
              {meta.title}
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl mx-auto">
          {meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {meta.tags.map((tag) => (
                <span key={tag} className="bg-brand-blue-light text-brand-blue text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-gray-900 mb-4">{meta.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-brand-gray-mid">
            <span>Autor: {meta.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={meta.date}>
              {format(new Date(meta.date), "d. MMMM yyyy.", { locale: srLatn })}
            </time>
          </div>
          {meta.image && !meta.noHero && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <Img src={meta.image} alt={meta.title} fill className="object-cover" priority />
            </div>
          )}
          <div className="prose max-w-none">
            <MDXRemote source={content} />
          </div>
          <div className="mt-12 pt-8 border-t border-brand-gray-mid">
            <Link href="/blog" className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Nazad na blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
