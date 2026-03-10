import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getAllSlugs } from "@/lib/mdx";
import { getEventBySlug, getAllEventSlugs } from "@/lib/events";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import ImageGallery from "@/components/ImageGallery";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const mdxSlugs = getAllSlugs("blog").map((slug) => ({ slug }));
  const eventSlugs = getAllEventSlugs().map((slug) => ({ slug }));
  return [...mdxSlugs, ...eventSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEventBySlug(params.slug);
  if (event) return { title: event.title };

  const data = getArticleBySlug("blog", params.slug);
  if (!data) return {};
  return { title: data.meta.title, description: data.meta.excerpt };
}

// ─── Event page ────────────────────────────────────────────────────────────

function EventPage({ slug }: { slug: string }) {
  const event = getEventBySlug(slug);
  if (!event) return notFound();

  const [heroImage, ...galleryImages] = event.images;

  // Split text into paragraphs
  const paragraphs = event.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-brand-blue">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">{event.title}</li>
          </ol>
        </nav>

        {/* Title & date */}
        <div className="mb-8">
          <span className="inline-block bg-brand-blue-light text-brand-blue text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            Događaj
          </span>
          <h1 className="text-gray-900 mb-2">{event.title}</h1>
          <time
            dateTime={event.date}
            className="text-sm text-brand-gray-text"
          >
            {format(new Date(event.date), "d. MMMM yyyy.", { locale: sr })}
          </time>
        </div>

        {/* Hero: image left + text right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* First image */}
          {heroImage && (
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[360px]">
              <Img
                src={heroImage}
                alt={`${event.title} — fotografija`}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Text content */}
          <div className="flex flex-col justify-center">
            <div className="prose max-w-none">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section aria-labelledby="gallery-heading" className="mt-12">
            <h2 id="gallery-heading" className="text-xl font-bold text-gray-900 mb-6">
              Fotografije sa događaja
            </h2>
            <ImageGallery images={galleryImages} title={event.title} />
          </section>
        )}

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-brand-gray-mid">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nazad na blog
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MDX page ──────────────────────────────────────────────────────────────

function MdxPage({ slug }: { slug: string }) {
  const data = getArticleBySlug("blog", slug);
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
            <span>{meta.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={meta.date}>
              {format(new Date(meta.date), "d. MMMM yyyy.", { locale: sr })}
            </time>
          </div>
          {meta.image && (
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

// ─── Router ────────────────────────────────────────────────────────────────

export default function BlogSlugPage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (event) return <EventPage slug={params.slug} />;

  const mdx = getArticleBySlug("blog", params.slug);
  if (mdx) return <MdxPage slug={params.slug} />;

  return notFound();
}
