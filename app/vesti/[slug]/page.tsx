import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getAllSlugs } from "@/lib/mdx";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs("vesti").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getArticleBySlug("vesti", params.slug);
  if (!data) return {};
  return {
    title: data.meta.title,
    description: data.meta.excerpt,
  };
}

export default function VestiSlugPage({ params }: Props) {
  const data = getArticleBySlug("vesti", params.slug);
  if (!data) notFound();

  const { meta, content } = data;

  return (
    <div className="section-padding">
      <div className="container-max">

        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/vesti" className="hover:text-brand-blue">Vesti</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium line-clamp-1 max-w-xs" aria-current="page">
              {meta.title}
            </li>
          </ol>
        </nav>

        {/* Tags + title + meta */}
        <div className="mb-8">
          {meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-blue-light text-brand-blue text-xs font-medium px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-gray-900 mb-3">{meta.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            {meta.author && <span>{meta.author}</span>}
            {meta.author && <span aria-hidden="true">·</span>}
            <time dateTime={meta.date}>
              {format(new Date(meta.date), "d. MMMM yyyy.", { locale: sr })}
            </time>
          </div>
        </div>

        {/* Image + text side by side */}
        {meta.image ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[340px]">
              <Img
                src={meta.image}
                alt={meta.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="prose max-w-none">
                <MDXRemote source={content} />
              </div>
            </div>
          </div>
        ) : (
          /* No image — full width content */
          <div className="max-w-3xl">
            <div className="prose max-w-none">
              <MDXRemote source={content} />
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-brand-gray-mid">
          <Link
            href="/vesti"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nazad na vesti
          </Link>
        </div>

      </div>
    </div>
  );
}
