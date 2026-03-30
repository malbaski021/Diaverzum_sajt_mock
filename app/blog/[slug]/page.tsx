import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import InstaText from "@/components/InstaText";
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

  const FLOAT_END = '{/* float-end */}';
  const splitIdx = content.indexOf(FLOAT_END);
  const floatBefore = splitIdx >= 0 ? content.slice(0, splitIdx).trim() : '';
  const floatAfter  = splitIdx >= 0 ? content.slice(splitIdx + FLOAT_END.length).trim() : content;

  if (meta.arhivirano === true) {
    return (
      <div className="section-padding">
        <div className="container-max">
          <nav aria-label="Putanja" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="hover:text-brand-blue">Blog</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 font-medium" aria-current="page">Nedostupan</li>
            </ol>
          </nav>
          <div className="max-w-3xl mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="23" y1="11" x2="17" y2="17"/><line x1="17" y1="11" x2="23" y2="17"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Blog je trenutno nedostupan</h1>
            <p className="text-gray-500 mb-8">Ovaj sadržaj je privremeno uklonjen sa sajta.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline">
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
            <InstaText text={`Autor: ${meta.author}`} />
            <span aria-hidden="true">·</span>
            <time dateTime={meta.date}>
              {format(new Date(meta.date), "d. MMMM yyyy.", { locale: srLatn })}
            </time>
          </div>
          {meta.image && !meta.noHero && meta.heroLayout === "float-2-3" ? (
            <>
              <div className="md:grid md:grid-cols-2 md:gap-8 mb-6 items-start">
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-4 md:mb-0">
                  <Img src={meta.image} alt={meta.title} fill className="object-cover" style={{ objectPosition: meta.heroObjectPosition ?? "center" }} priority />
                </div>
                {floatBefore && (
                  <div className="prose max-w-none">
                    <MDXRemote source={floatBefore} />
                  </div>
                )}
              </div>
              <div className="prose max-w-none w-full overflow-hidden">
                <MDXRemote source={floatAfter} />
              </div>
            </>
          ) : meta.image && !meta.noHero && meta.heroLayout === "float-4-3" ? (
            <>
              <div className="md:grid md:grid-cols-2 md:gap-8 mb-6 items-start">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 md:mb-0">
                  <Img src={meta.image} alt={meta.title} fill className="object-cover" style={{ objectPosition: meta.heroObjectPosition ?? "center" }} priority />
                </div>
                {floatBefore && (
                  <div className="prose max-w-none">
                    <MDXRemote source={floatBefore} />
                  </div>
                )}
              </div>
              <div className="prose max-w-none w-full overflow-hidden">
                <MDXRemote source={floatAfter} />
              </div>
            </>
          ) : meta.image && !meta.noHero && meta.heroLayout === "float" ? (
            <div className="mb-8 overflow-hidden">
              <div className="mb-4 md:float-left md:w-1/2 md:mr-8 md:mb-4">
                <Img src={meta.image} alt={meta.title} width={800} height={1200} className="w-full h-auto rounded-xl" priority />
              </div>
              <div className="prose max-w-none">
                <MDXRemote source={content} />
              </div>
            </div>
          ) : meta.image && !meta.noHero && meta.heroLayout === "landscape" ? (
            <>
              <div className="mb-8 rounded-xl overflow-hidden">
                <Img src={meta.image} alt={meta.title} width={1263} height={664} className="w-full h-auto" priority />
              </div>
              <div className="prose max-w-none w-full overflow-hidden">
                <MDXRemote source={content} />
              </div>
            </>
          ) : (
            <>
              {meta.image && !meta.noHero && (
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                  <Img src={meta.image} alt={meta.title} fill className="object-cover" priority />
                </div>
              )}
              <div className="prose max-w-none w-full overflow-hidden">
                <MDXRemote source={content} />
              </div>
            </>
          )}
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
