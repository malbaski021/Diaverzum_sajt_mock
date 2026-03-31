import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface EventData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  folderName: string;
  content: string;
  images: string[]; // public URLs
  author: string;
}

function getImages(slug: string): string[] {
  const publicDir = path.join(
    process.cwd(),
    "public",
    "content",
    "dogadjaji",
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
    .map((f) => `/content/dogadjaji/${slug}/${f}`);
}

export function getAllEvents(): EventData[] {
  const dogadjaji = path.join(process.cwd(), "content", "dogadjaji");
  if (!fs.existsSync(dogadjaji)) return [];

  const events: EventData[] = [];

  for (const entry of fs.readdirSync(dogadjaji, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const folderPath = path.join(dogadjaji, entry.name);
    const mdxFile = fs
      .readdirSync(folderPath)
      .find((f) => f.endsWith(".mdx"));

    if (!mdxFile) continue;

    const raw = fs.readFileSync(path.join(folderPath, mdxFile), "utf-8");
    const { data, content } = matter(raw);
    const slug = path.basename(mdxFile, ".mdx");

    if (data.arhivirano === true) continue;

    events.push({
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      folderName: entry.name,
      content: content.trim(),
      images: getImages(slug),
      author: data.author ?? "",
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getEventBySlug(slug: string): EventData | null {
  return getAllEvents().find((e) => e.slug === slug) ?? null;
}

export function getAllEventSlugs(): string[] {
  return getAllEvents().map((e) => e.slug);
}
