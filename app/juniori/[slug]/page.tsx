import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import { getJunioriPostBySlug, getAllJunioriSlugs } from "@/lib/juniori";
import JunioriVideoPlayer from "@/components/JunioriVideoPlayer";
import JunioriGallery from "@/components/JunioriGallery";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllJunioriSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getJunioriPostBySlug(params.slug);
  if (!data) return {};
  return {
    title: `${data.post.title} — Diaverzum Juniori`,
    description: data.post.excerpt,
  };
}

export default function JunioriSlugPage({ params }: Props) {
  const data = getJunioriPostBySlug(params.slug);
  if (!data) notFound();

  const { post, content } = data;

  return (
    <div className="section-padding">
      <div className="container-max px-4">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-brand-blue">
                Početna
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/juniori" className="hover:text-brand-blue">
                Juniori
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li
              className="text-gray-900 font-medium line-clamp-1 max-w-xs"
              aria-current="page"
            >
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          {/* Type badge */}
          {post.type === "video" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Video
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue-light text-brand-blue mb-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Galerija
            </span>
          )}

          <h1 className="text-gray-900 mb-3">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            {post.author && <span>{post.author}</span>}
            {post.author && <span aria-hidden="true">·</span>}
            <time dateTime={post.date}>
              {format(new Date(post.date), "d. MMMM yyyy.", { locale: sr })}
            </time>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-blue-light text-brand-blue text-xs font-medium px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Video player */}
        {post.type === "video" && post.videoSrc && (
          <div className="mb-10">
            <JunioriVideoPlayer src={post.videoSrc} title={post.title} />
          </div>
        )}

        {/* MDX content */}
        <div className="max-w-3xl mb-12">
          <div className="prose max-w-none">
            <MDXRemote source={content} />
          </div>
        </div>

        {/* Gallery */}
        {post.images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Fotografije</h2>
            <JunioriGallery images={post.images} title={post.title} />
          </div>
        )}

        {/* Back */}
        <div className="pt-8 border-t border-brand-gray-mid">
          <Link
            href="/juniori"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nazad na Juniori
          </Link>
        </div>
      </div>
    </div>
  );
}
