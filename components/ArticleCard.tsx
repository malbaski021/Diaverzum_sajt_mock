import Link from "next/link";
import Img from "@/components/Img";
import { ArticleMeta } from "@/types";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";

interface Props {
  article: ArticleMeta;
  section: "vesti" | "blog";
}

export default function ArticleCard({ article, section }: Props) {
  const href = `/${section}/${article.slug}`;

  return (
    <article className="card overflow-hidden group">
      {/* Image */}
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <div className="relative h-48 bg-brand-blue-light overflow-hidden">
          {article.image ? (
            <Img
              src={article.image}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ objectPosition: article.heroObjectPosition ?? "center" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">
                {section === "vesti" ? "📰" : "📝"}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-brand-blue-light text-brand-blue text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
          <Link href={href}>{article.title}</Link>
        </h2>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{article.author}</span>
          <time dateTime={article.date}>
            {format(new Date(article.date), "d. MMM yyyy.", { locale: srLatn })}
          </time>
        </div>
      </div>
    </article>
  );
}
