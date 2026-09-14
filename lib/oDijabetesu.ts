import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DijabetesSection {
  id: string;
  title: string;
  intro: string;
  content: string;
  archived: boolean;
}

const FILE_PATH = path.join(process.cwd(), "content", "o-dijabetesu", "sadrzaj.md");
const BLOCK_SEPARATOR = /^===\s*$/m;
const MORE_MARKER = /<!--\s*more\s*-->/;

export function getDijabetesSections(): DijabetesSection[] {
  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  const blocks = raw.split(BLOCK_SEPARATOR).map((b) => b.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      const { data, content } = matter(block);
      const [introRaw, contentRaw = ""] = content.split(MORE_MARKER);
      return {
        id: String(data.id ?? ""),
        title: String(data.title ?? ""),
        archived: Boolean(data.archived),
        intro: introRaw.trim(),
        content: contentRaw.trim(),
      };
    })
    .filter((s) => !s.archived && s.id && s.title);
}
