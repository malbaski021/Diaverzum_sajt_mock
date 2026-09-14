import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "develop";
const GITHUB_API = "https://api.github.com";
const IS_LOCAL = process.env.NODE_ENV === "development";
const ROOT = process.cwd();
const FILE_REL_PATH = "content/o-dijabetesu/sadrzaj.md";

interface DijabetesSection {
  id: string;
  title: string;
  intro: string;
  content: string;
  archived: boolean;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function enc(p: string): string {
  return p.split("/").map(encodeURIComponent).join("/");
}

async function getFileFromGitHub(): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(FILE_REL_PATH)}?ref=${GITHUB_BRANCH}`,
    {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  return { content, sha: data.sha };
}

async function putFileToGitHub(content: string, sha: string | null, message: string) {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(FILE_REL_PATH)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub API error: ${JSON.stringify(err)}`);
  }
}

const BLOCK_SEPARATOR = /^===\s*$/m;
const MORE_MARKER = /<!--\s*more\s*-->/;

function parseSadrzaj(raw: string): DijabetesSection[] {
  const blocks = raw.split(BLOCK_SEPARATOR).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const normalized = block.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) {
      return { id: "", title: "", intro: "", content: "", archived: false };
    }
    const fmRaw = fmMatch[1];
    const body = fmMatch[2];
    const fm: Record<string, string> = {};
    for (const line of fmRaw.split("\n")) {
      const idx = line.indexOf(": ");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 2).replace(/^"|"$/g, "").trim();
      fm[key] = val;
    }
    const [introRaw, contentRaw = ""] = body.split(MORE_MARKER);
    return {
      id: fm.id ?? "",
      title: fm.title ?? "",
      intro: introRaw.trim(),
      content: contentRaw.trim(),
      archived: fm.archived === "true",
    };
  });
}

function serializeBlock(s: DijabetesSection): string {
  return [
    `---`,
    `id: ${s.id}`,
    `title: "${s.title.replace(/"/g, '\\"')}"`,
    `archived: ${s.archived}`,
    `---`,
    ``,
    s.intro.trim(),
    ``,
    `<!-- more -->`,
    ``,
    s.content.trim(),
  ].join("\n");
}

function serializeSadrzaj(sections: DijabetesSection[]): string {
  return sections.map(serializeBlock).join("\n\n===\n\n") + "\n";
}

function assignIdsAndValidate(sections: DijabetesSection[]): { sections: DijabetesSection[]; error?: string } {
  const usedIds = new Set<string>();
  const result: DijabetesSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const title = (s.title ?? "").trim();
    if (!title) {
      return { sections: [], error: `Kategorija #${i + 1}: naslov ne sme biti prazan.` };
    }
    const intro = (s.intro ?? "").trim();
    if (!intro) {
      return { sections: [], error: `Kategorija "${title}": intro ne sme biti prazan.` };
    }

    let id = (s.id ?? "").trim();
    if (!id) {
      const base = toSlug(title);
      if (!base) {
        return { sections: [], error: `Kategorija "${title}": iz naslova se ne može generisati validan ID.` };
      }
      id = base;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${base}-${suffix}`;
        suffix++;
      }
    } else {
      if (usedIds.has(id)) {
        return { sections: [], error: `Duplikat ID-a: "${id}". Svaki ID mora biti jedinstven.` };
      }
    }
    usedIds.add(id);

    result.push({
      id,
      title,
      intro,
      content: (s.content ?? "").trim(),
      archived: Boolean(s.archived),
    });
  }

  return { sections: result };
}

export async function GET() {
  try {
    let raw: string;
    if (IS_LOCAL) {
      const abs = path.join(ROOT, FILE_REL_PATH);
      if (!fs.existsSync(abs)) {
        return NextResponse.json({ sections: [] });
      }
      raw = fs.readFileSync(abs, "utf-8");
    } else {
      const file = await getFileFromGitHub();
      if (!file) return NextResponse.json({ sections: [] });
      raw = file.content;
    }
    const sections = parseSadrzaj(raw);
    return NextResponse.json({ sections });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming: DijabetesSection[] = Array.isArray(body?.sections) ? body.sections : [];

    const { sections, error } = assignIdsAndValidate(incoming);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const serialized = serializeSadrzaj(sections);

    if (IS_LOCAL) {
      const abs = path.join(ROOT, FILE_REL_PATH);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, serialized, "utf-8");
      return NextResponse.json({ sections });
    }

    const existing = await getFileFromGitHub();
    await putFileToGitHub(serialized, existing?.sha ?? null, `Admin: izmeni sadržaj O dijabetesu`);
    return NextResponse.json({ sections });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
