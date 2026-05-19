import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ArticleMeta } from "@/types";

function getContentDir(section: "vesti" | "blog") {
  return path.join(process.cwd(), "content", section);
}

function findMdxInFolder(folderPath: string): string | null {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".mdx"));
  return files.length > 0 ? path.join(folderPath, files[0]) : null;
}

// Looks for image in public/ (legacy) or co-located in content folder, copies to public if needed
function findFolderImage(
  section: "vesti" | "blog",
  folderName: string,
  slug: string
): string | null {
  const publicDir = path.join(process.cwd(), "public", "content", section, slug);

  // Check public folder first
  if (fs.existsSync(publicDir)) {
    const img = fs.readdirSync(publicDir).find((f) =>
      /\.(png|jpg|jpeg|webp)$/i.test(f)
    );
    if (img) return `/content/${section}/${slug}/${img}`;
  }

  // Check co-located in content folder
  if (folderName) {
    const contentDir = path.join(process.cwd(), "content", section, folderName);
    if (fs.existsSync(contentDir)) {
      const img = fs.readdirSync(contentDir).find((f) =>
        /\.(png|jpg|jpeg|webp)$/i.test(f)
      );
      if (img) {
        // Copy to public so Next.js can serve it
        fs.mkdirSync(publicDir, { recursive: true });
        fs.copyFileSync(
          path.join(contentDir, img),
          path.join(publicDir, img)
        );
        return `/content/${section}/${slug}/${img}`;
      }
    }
  }

  return null;
}

export function getAllArticles(section: "vesti" | "blog"): ArticleMeta[] {
  const dir = getContentDir(section);
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const articles = entries
    .map((entry) => {
      let slug: string;
      let mdxPath: string;
      let folderName = "";

      if (entry.isDirectory()) {
        const found = findMdxInFolder(path.join(dir, entry.name));
        if (!found) return null;
        slug = path.basename(found, ".mdx"); // MDX filename is the slug
        mdxPath = found;
        folderName = entry.name;
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        slug = entry.name.replace(/\.mdx$/, "");
        mdxPath = path.join(dir, entry.name);
      } else {
        return null;
      }

      const raw = fs.readFileSync(mdxPath, "utf-8");
      const { data } = matter(raw);
      const image = data.image || findFolderImage(section, folderName, slug) || null;

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

  let mdxPath: string | null = null;
  let folderName = "";

  // Search all directories for MDX file whose name matches the slug
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const folderPath = path.join(dir, entry.name);
        const found = findMdxInFolder(folderPath);
        if (found && path.basename(found, ".mdx") === slug) {
          mdxPath = found;
          folderName = entry.name;
          break;
        }
      }
    }
  }

  // Fallback: flat .mdx file
  if (!mdxPath) {
    const flat = path.join(dir, `${slug}.mdx`);
    if (fs.existsSync(flat)) mdxPath = flat;
  }

  if (!mdxPath) return null;

  const raw = fs.readFileSync(mdxPath, "utf-8");
  const { data, content } = matter(raw);
  const image = data.image || findFolderImage(section, folderName, slug) || null;

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

  const slugs: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const found = findMdxInFolder(path.join(dir, entry.name));
      if (found) slugs.push(path.basename(found, ".mdx"));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      slugs.push(entry.name.replace(/\.mdx$/, ""));
    }
  }

  return slugs;
}
