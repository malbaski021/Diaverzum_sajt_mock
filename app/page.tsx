import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import NewsSlider from "@/components/NewsSlider";
import { getAllArticles } from "@/lib/mdx";

const quickLinks = [
  {
    icon: "🩺",
    title: "Šta je dijabetes?",
    desc: "Saznajte osnovne informacije o dijabetesu tipa 1 i tipa 2.",
    href: "/o-dijabetesu",
  },
  {
    icon: "🥗",
    title: "Ishrana i dijabetes",
    desc: "Saveti za pravilnu ishranu koja pomaže kontroli šećera.",
    href: "/o-dijabetesu#ishrana",
  },
  {
    icon: "💊",
    title: "Terapija i lekovi",
    desc: "Insulinska terapija, oralni lekovi i monitoring.",
    href: "/o-dijabetesu#terapija",
  },
  {
    icon: "🤝",
    title: "Pridruži se",
    desc: "Postani član udruženja i dobij pristup svim programima.",
    href: "/clanovi",
  },
];

export default function HomePage() {
  const latestNews = getAllArticles("vesti").slice(0, 5);
  const latestBlog = getAllArticles("blog").slice(0, 3);

  return (
    <>
      <HeroSection />

      {/* Latest News */}
      <section className="section-padding bg-brand-gray" aria-labelledby="news-heading">
        <div className="container-max">
          <div className="flex items-center justify-between mb-6">
            <h2 id="news-heading" className="text-2xl font-bold text-gray-900">
              Najnovije vesti
            </h2>
            <Link href="/vesti" className="text-brand-blue font-medium text-sm hover:underline">
              Sve vesti →
            </Link>
          </div>
          {latestNews.length > 0 ? (
            <NewsSlider articles={latestNews} />
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <p>Vesti uskoro...</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="section-padding" aria-labelledby="quick-heading">
        <div className="container-max">
          <h2 id="quick-heading" className="text-2xl font-bold text-gray-900 mb-6">
            Brzi pristup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="card p-5 group">
                <span className="text-3xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-1 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog section */}
      {latestBlog.length > 0 && (
        <section className="section-padding" aria-labelledby="blog-heading">
          <div className="container-max">
            <div className="flex items-center justify-between mb-8">
              <h2 id="blog-heading" className="text-2xl font-bold text-gray-900">
                Iz bloga
              </h2>
              <Link href="/blog" className="text-brand-blue font-medium text-sm hover:underline">
                Svi tekstovi →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlog.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card group overflow-hidden"
                >
                  <div className="h-40 bg-brand-blue-light flex items-center justify-center">
                    <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">📝</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-brand-gray-text mb-2 uppercase tracking-wider">
                      {post.author}
                    </p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-blue transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-brand-blue-light py-16 px-4" aria-labelledby="cta-heading">
        <div className="container-max text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-brand-blue mx-auto mb-6 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-brand-blue font-bold text-xl">14</span>
          </div>
          <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
            14. novembar — Svetski dan dijabetesa
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Svake godine obeležavamo Svetski dan dijabetesa kroz edukativne
            aktivnosti, besplatne preglede i javne manifestacije u Novom Sadu.
          </p>
          <Link href="/vesti" className="btn-primary">
            Pogledaj naše aktivnosti
          </Link>
        </div>
      </section>
    </>
  );
}
