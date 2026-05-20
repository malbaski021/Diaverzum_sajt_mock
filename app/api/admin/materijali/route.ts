import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "develop";
const GITHUB_API = "https://api.github.com";
const IS_LOCAL = process.env.NODE_ENV === "development";
const ROOT = process.cwd();

const META_REL_PATH = "content/o-dijabetesu/materijali.json";
const FILES_REL_DIR = "public/content/materijal";

const MATERIJAL_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx)$/i;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface Materijal {
  file: string;
  archived: boolean;
}

function enc(p: string): string {
  return p.split("/").map(encodeURIComponent).join("/");
}

async function getFileFromGitHub(relPath: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(relPath)}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

async function listGitHubDir(relPath: string): Promise<{ name: string }[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(relPath)}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function putFileToGitHub(relPath: string, base64Content: string, sha: string | null, message: string) {
  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(relPath)}`,
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

async function deleteFileFromGitHub(relPath: string, sha: string, message: string) {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(relPath)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ message, sha, branch: GITHUB_BRANCH }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub delete error: ${JSON.stringify(err)}`);
  }
}

async function readMeta(): Promise<{ items: Materijal[]; sha: string | null }> {
  if (IS_LOCAL) {
    const abs = path.join(ROOT, META_REL_PATH);
    if (!fs.existsSync(abs)) return { items: await seedItemsLocal(), sha: null };
    try {
      const parsed = JSON.parse(fs.readFileSync(abs, "utf-8"));
      if (!Array.isArray(parsed)) return { items: await seedItemsLocal(), sha: null };
      return { items: parsed, sha: null };
    } catch {
      return { items: await seedItemsLocal(), sha: null };
    }
  }

  const file = await getFileFromGitHub(META_REL_PATH);
  if (!file) {
    return { items: await seedItemsGitHub(), sha: null };
  }
  try {
    const raw = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: await seedItemsGitHub(), sha: file.sha };
    return { items: parsed, sha: file.sha };
  } catch {
    return { items: await seedItemsGitHub(), sha: file.sha };
  }
}

async function seedItemsLocal(): Promise<Materijal[]> {
  const dir = path.join(ROOT, FILES_REL_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => MATERIJAL_EXTENSIONS.test(f))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => ({ file: f, archived: false }));
}

async function seedItemsGitHub(): Promise<Materijal[]> {
  const entries = await listGitHubDir(FILES_REL_DIR);
  return entries
    .filter((e) => MATERIJAL_EXTENSIONS.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({ file: e.name, archived: false }));
}

async function writeMeta(items: Materijal[], expectedSha: string | null, message: string) {
  const json = JSON.stringify(items, null, 2) + "\n";
  if (IS_LOCAL) {
    const abs = path.join(ROOT, META_REL_PATH);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, json, "utf-8");
    return;
  }
  let sha = expectedSha;
  if (!sha) {
    const existing = await getFileFromGitHub(META_REL_PATH);
    sha = existing?.sha ?? null;
  }
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  await putFileToGitHub(META_REL_PATH, base64, sha, message);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").trim();
}

export async function GET() {
  try {
    const { items } = await readMeta();
    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");
    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json({ error: "Fajl nije poslat." }, { status: 400 });
    }
    const file = fileEntry as Blob & { name?: string };
    const name = sanitizeFileName(file.name ?? "");
    if (!name) {
      return NextResponse.json({ error: "Nevažeće ime fajla." }, { status: 400 });
    }
    if (!MATERIJAL_EXTENSIONS.test(name)) {
      return NextResponse.json(
        { error: `Nepodržan tip fajla: ${name}. Dozvoljeno: PDF, DOC, DOCX, XLS, XLSX.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fajl ${name} je veći od 10 MB.` },
        { status: 400 }
      );
    }
    if (file.type && !ALLOWED_MIME.has(file.type) && file.type !== "application/octet-stream") {
      // dozvoli octet-stream jer neki browseri tako šalju
      return NextResponse.json(
        { error: `Nepodržan MIME: ${file.type}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relPath = `${FILES_REL_DIR}/${name}`;

    const { items, sha: metaSha } = await readMeta();
    if (items.some((m) => m.file === name)) {
      return NextResponse.json(
        { error: `Fajl "${name}" već postoji. Preimenuj pre upload-a.` },
        { status: 409 }
      );
    }

    if (IS_LOCAL) {
      const abs = path.join(ROOT, relPath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, buffer);
    } else {
      await putFileToGitHub(relPath, buffer.toString("base64"), null, `Admin: upload materijal ${name}`);
    }

    const updated = [...items, { file: name, archived: false }].sort((a, b) =>
      a.file.localeCompare(b.file)
    );
    await writeMeta(updated, metaSha, `Admin: dodaj materijal ${name} u metadata`);

    return NextResponse.json({ items: updated });
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
    const files: string[] = Array.isArray(body?.files) ? body.files : [];
    const action: string = body?.action;
    if (!files.length || !["archive", "unarchive"].includes(action)) {
      return NextResponse.json(
        { error: "Potrebni: files (niz) i action ('archive' ili 'unarchive')." },
        { status: 400 }
      );
    }

    const { items, sha } = await readMeta();
    const targets = new Set(files);
    const updated = items.map((m) =>
      targets.has(m.file) ? { ...m, archived: action === "archive" } : m
    );

    const verb = action === "archive" ? "arhiviraj" : "vrati iz arhive";
    await writeMeta(updated, sha, `Admin: ${verb} materijal${files.length > 1 ? "e" : ""} (${files.length})`);

    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const files: string[] = Array.isArray(body?.files) ? body.files : [];
    if (!files.length) {
      return NextResponse.json({ error: "Potreban: files (niz)." }, { status: 400 });
    }

    const { items, sha } = await readMeta();
    const targets = new Set(files);

    for (const fileName of files) {
      const relPath = `${FILES_REL_DIR}/${fileName}`;
      if (IS_LOCAL) {
        const abs = path.join(ROOT, relPath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } else {
        const file = await getFileFromGitHub(relPath);
        if (file) {
          await deleteFileFromGitHub(relPath, file.sha, `Admin: obriši materijal ${fileName}`);
        }
      }
    }

    const updated = items.filter((m) => !targets.has(m.file));
    await writeMeta(updated, sha, `Admin: ukloni materijal${files.length > 1 ? "e" : ""} iz metadata (${files.length})`);

    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
