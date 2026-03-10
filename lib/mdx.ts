import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ArticleMeta } from "@/types";

function getContentDir(section: "vesti" | "blog") {
  return path.join(process.cwd(), "content", section);
}

// Finds MDX file inside a folder (e.g. content/vesti/slug/slug.mdx)
function findMdxInFolder(folderPath: string): string | null {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".mdx"));
  return files.length > 0 ? path.join(folderPath, files[0]) : null;
}

// Returns public image URL if image.* exists in the folder
function findFolderImage(section: "vesti" | "blog", slug: string): string | null {
  const publicDir = path.join(process.cwd(), "public", "content", section, slug);
  if (!fs.existsSync(publicDir)) return null;
  const img = fs.readdirSync(publicDir).find((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );
  return img ? `/content/${section}/${slug}/${img}` : null;
}

export function getAllArticles(section: "vesti" | "blog"): ArticleMeta[] {
  const dir = getContentDir(section);
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const articles = entries
    .map((entry) => {
      let slug: string;
      let mdxPath: string;

      if (entry.isDirectory()) {
        slug = entry.name;
        const found = findMdxInFolder(path.join(dir, entry.name));
        if (!found) return null;
        mdxPath = found;
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        slug = entry.name.replace(/\.mdx$/, "");
        mdxPath = path.join(dir, entry.name);
      } else {
        return null;
      }

      const raw = fs.readFileSync(mdxPath, "utf-8");
      const { data } = matter(raw);
      const image =
        data.image || findFolderImage(section, slug) || null;

      return {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        image,
        author: data.author ?? "",
        tags: data.tags ?? [],
      } as ArticleMeta;
    })
    .filter(Boolean) as ArticleMeta[];

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticleBySlug(
  section: "vesti" | "blog",
  slug: string
): { meta: ArticleMeta; content: string } | null {
  const dir = getContentDir(section);

  // Try folder-based first
  const folderPath = path.join(dir, slug);
  let mdxPath: string | null = null;

  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    mdxPath = findMdxInFolder(folderPath);
  }

  // Fallback: flat .mdx file
  if (!mdxPath) {
    const flat = path.join(dir, `${slug}.mdx`);
    if (fs.existsSync(flat)) mdxPath = flat;
  }

  if (!mdxPath) return null;

  const raw = fs.readFileSync(mdxPath, "utf-8");
  const { data, content } = matter(raw);
  const image = data.image || findFolderImage(section, slug) || null;

  return {
    meta: {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      image,
      author: data.author ?? "",
      tags: data.tags ?? [],
    },
    content,
  };
}

export function getAllSlugs(section: "vesti" | "blog"): string[] {
  const dir = getContentDir(section);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .map((entry) => {
      if (entry.isDirectory()) return entry.name;
      if (entry.isFile() && entry.name.endsWith(".mdx"))
        return entry.name.replace(/\.mdx$/, "");
      return null;
    })
    .filter(Boolean) as string[];
}
