import fs from "fs";
import path from "path";

export interface Materijal {
  file: string;
  archived: boolean;
}

export const MATERIJAL_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx)$/i;

const META_PATH = path.join(
  process.cwd(),
  "content",
  "o-dijabetesu",
  "materijali.json"
);
const FILES_DIR = path.join(
  process.cwd(),
  "public",
  "content",
  "materijal"
);

function seedFromDisk(): Materijal[] {
  if (!fs.existsSync(FILES_DIR)) return [];
  return fs
    .readdirSync(FILES_DIR)
    .filter((f) => MATERIJAL_EXTENSIONS.test(f))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => ({ file: f, archived: false }));
}

export function getMaterijali(): Materijal[] {
  if (fs.existsSync(META_PATH)) {
    try {
      const raw = fs.readFileSync(META_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seedFromDisk();
      return parsed.filter(
        (m): m is Materijal =>
          m && typeof m.file === "string" && typeof m.archived === "boolean"
      );
    } catch {
      return seedFromDisk();
    }
  }
  return seedFromDisk();
}

export function getActiveMaterijali(): Materijal[] {
  return getMaterijali().filter((m) => !m.archived);
}

export function getMaterijalTitle(file: string): string {
  return file.replace(MATERIJAL_EXTENSIONS, "");
}
