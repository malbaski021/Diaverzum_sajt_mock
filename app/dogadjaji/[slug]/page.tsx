import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import { getEventBySlug, getAllEventSlugs } from "@/lib/events";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import ImageGallery from "@/components/ImageGallery";
import InstaText from "@/components/InstaText";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEventBySlug(params.slug);
  if (!event) return {};
  return { title: event.title };
}

export default function DogadjajPage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (!event) return notFound();

  const [heroImage, ...galleryImages] = event.images;

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
            <li><Link href="/dogadjaji" className="hover:text-brand-blue">Događaji</Link></li>
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
          <div className="flex items-center gap-4 text-sm text-brand-gray-text">
            <time dateTime={event.date}>
              {format(new Date(event.date), "d. MMMM yyyy.", { locale: srLatn })}
            </time>
            {event.author && (
              <>
                <span aria-hidden="true">·</span>
                <InstaText text={`Autor: ${event.author}`} />
              </>
            )}
          </div>
        </div>

        {/* Hero: image floats left, text wraps around and expands below */}
        <div className="mb-8 overflow-hidden">
          {heroImage && (
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 md:float-left md:w-1/2 md:mr-8 md:mb-4">
              <Img
                src={heroImage}
                alt={`${event.title} — fotografija`}
                fill
                className="object-cover"
                style={{ objectPosition: event.heroObjectPosition ?? "center" }}
                priority
              />
            </div>
          )}
          <div className="prose max-w-none">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                <InstaText text={para} />
              </p>
            ))}
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
            href="/dogadjaji"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nazad na događaje
          </Link>
        </div>
      </div>
    </div>
  );
}
