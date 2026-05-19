import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { JunioriPost } from "@/types";

const CONTENT_DIR = path.join(process.cwd(), "content", "juniori");

function findMdxInFolder(folderPath: string): string | null {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".mdx"));
  return files.length > 0 ? path.join(folderPath, files[0]) : null;
}

function getGalleryImages(slug: string): string[] {
  const publicDir = path.join(
    process.cwd(),
    "public",
    "content",
    "juniori",
    "gallery",
    slug
  );
  if (!fs.existsSync(publicDir)) return [];
  return fs
    .readdirSync(publicDir)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a);
      const nb = parseInt(b);
      return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
    })
    .map((f) => `/content/juniori/gallery/${slug}/${f}`);
}

function resolveCoverImage(
  data: Record<string, unknown>,
  images: string[]
): string | null {
  if (data.coverImage) return data.coverImage as string;
  return images.length > 0 ? images[0] : null;
}

function parseFolder(folderPath: string): JunioriPost | null {
  const mdxPath = findMdxInFolder(folderPath);
  if (!mdxPath) return null;

  const slug = path.basename(mdxPath, ".mdx");
  const raw = fs.readFileSync(mdxPath, "utf-8");
  const { data } = matter(raw);
  const images = getGalleryImages(slug);
  const coverImage = resolveCoverImage(data, images);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    type: (data.type ?? "gallery") as "video" | "gallery",
    coverImage,
    videoSrc: data.videoSrc,
    images,
    author: data.author ?? "",
    tags: data.tags ?? [],
  };
}

export function getAllJunioriPosts(): JunioriPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => parseFolder(path.join(CONTENT_DIR, e.name)))
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date((b as JunioriPost).date).getTime() -
        new Date((a as JunioriPost).date).getTime()
    ) as JunioriPost[];
}

export function getJunioriPostBySlug(
  slug: string
): { post: JunioriPost; content: string } | null {
  if (!fs.existsSync(CONTENT_DIR)) return null;

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(CONTENT_DIR, entry.name);
    const mdxPath = findMdxInFolder(folderPath);
    if (!mdxPath) continue;
    if (path.basename(mdxPath, ".mdx") !== slug) continue;

    const raw = fs.readFileSync(mdxPath, "utf-8");
    const { data, content } = matter(raw);
    const images = getGalleryImages(slug);
    const coverImage = resolveCoverImage(data, images);

    return {
      post: {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        type: (data.type ?? "gallery") as "video" | "gallery",
        coverImage,
        videoSrc: data.videoSrc,
        images,
        author: data.author ?? "",
        tags: data.tags ?? [],
      },
      content,
    };
  }

  return null;
}

export function getAllJunioriSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const mdxPath = findMdxInFolder(path.join(CONTENT_DIR, e.name));
      return mdxPath ? path.basename(mdxPath, ".mdx") : null;
    })
    .filter(Boolean) as string[];
}
