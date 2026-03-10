import fs from "fs";
import path from "path";

export interface EventData {
  slug: string;
  title: string;
  date: string;
  folderName: string;
  content: string;
  images: string[]; // public URLs
}

// Map folder names to slugs and metadata
const EVENT_MAP: Record<
  string,
  { slug: string; title: string; date: string }
> = {
  "12 JAN 2026 - Madjionicar": {
    slug: "madjionicar-januar-2026",
    title: "Mađioničar u Diaverzumu",
    date: "2026-01-12",
  },
  "16 Novembar 2025 - Predstava - Banja Luka": {
    slug: "predstava-banja-luka-2025",
    title: "Predstava u Banja Luci",
    date: "2025-11-16",
  },
  "26 Nov 2025 - Turnir": {
    slug: "turnir-novembar-2025",
    title: "Humanitarni fudbalski turnir",
    date: "2025-11-26",
  },
};

function readTextFile(folderPath: string): string {
  const files = fs.readdirSync(folderPath);
  const txtFile = files.find((f) => f.toLowerCase().endsWith(".txt"));
  if (!txtFile) return "";
  return fs.readFileSync(path.join(folderPath, txtFile), "utf-8").trim();
}

function getImages(slug: string): string[] {
  const publicDir = path.join(
    process.cwd(),
    "public",
    "content",
    "events",
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
    .map((f) => `/content/events/${slug}/${f}`);
}

export function getAllEvents(): EventData[] {
  const blogDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) return [];

  return Object.entries(EVENT_MAP)
    .map(([folderName, meta]) => {
      const folderPath = path.join(blogDir, folderName);
      const content = fs.existsSync(folderPath)
        ? readTextFile(folderPath)
        : "";
      const images = getImages(meta.slug);
      return { ...meta, folderName, content, images };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEventBySlug(slug: string): EventData | null {
  return getAllEvents().find((e) => e.slug === slug) ?? null;
}

export function getAllEventSlugs(): string[] {
  return getAllEvents().map((e) => e.slug);
}
