import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "develop";

const GITHUB_API = "https://api.github.com";
const IS_LOCAL = process.env.NODE_ENV === "development";

function encodePath(p: string): string {
  return p.split("/").map(encodeURIComponent).join("/");
}

async function getFileContent(filePath: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(filePath)}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

async function getFileSha(filePath: string): Promise<string | null> {
  const file = await getFileContent(filePath);
  return file?.sha ?? null;
}

async function putFile(filePath: string, base64Content: string, message: string, sha?: string | null) {
  const body: Record<string, unknown> = { message, content: base64Content, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(filePath)}`,
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
  return res.json();
}

// --- Lokalne (filesystem) operacije ---

const ROOT = process.cwd();

function localReadJson(relPath: string) {
  const abs = path.join(ROOT, relPath);
  return JSON.parse(fs.readFileSync(abs, "utf-8"));
}

function localWriteJson(relPath: string, data: unknown) {
  const abs = path.join(ROOT, relPath);
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf-8");
}

function localWriteImage(relPath: string, buffer: Buffer) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buffer);
}

// --- Handler ---

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string)?.trim();
    const bio = (formData.get("bio") as string)?.trim() ?? "";
    const image = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Ime je obavezno." }, { status: 400 });
    }

    const jsonRelPath = "content/clanovi/clanovi.json";

    if (IS_LOCAL) {
      // Lokalni mod — piši direktno na disk
      const members = localReadJson(jsonRelPath) as { id?: number; name: string; role: string; image: string; bio: string }[];
      const filtered = members.filter((m) => m.name.trim() !== "");
      const newId = filtered.reduce((max, m) => Math.max(max, m.id ?? 0), 0) + 1;

      let imagePath = "";

      if (image && image.size > 0) {
        const ext = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${name} ${newId}.${ext}`;
        const buffer = Buffer.from(await image.arrayBuffer());

        localWriteImage(`public/content/clanovi/${filename}`, buffer);
        localWriteImage(`content/clanovi/${filename}`, buffer);

        imagePath = `/content/clanovi/${filename}`;
      }

      filtered.push({ id: newId, name, role: "", image: imagePath, bio });
      localWriteJson(jsonRelPath, filtered);

      return NextResponse.json({ success: true });
    }

    // Produkcijski mod — GitHub API
    const jsonFile = await getFileContent(jsonRelPath);
    if (!jsonFile) {
      return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });
    }

    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as { id?: number; name: string; role: string; image: string; bio: string }[];
    const filtered = members.filter((m) => m.name.trim() !== "");
    const newId = filtered.reduce((max, m) => Math.max(max, m.id ?? 0), 0) + 1;

    let imagePath = "";

    if (image && image.size > 0) {
      const ext = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${name} ${newId}.${ext}`;
      const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");

      const publicPath = `public/content/clanovi/${filename}`;
      const contentPath = `content/clanovi/${filename}`;

      const publicSha = await getFileSha(publicPath);
      await putFile(publicPath, base64, `Admin: dodaj sliku za ${name}`, publicSha);

      const contentSha = await getFileSha(contentPath);
      await putFile(contentPath, base64, `Admin: dodaj sliku za ${name}`, contentSha);

      imagePath = `/content/clanovi/${filename}`;
    }

    filtered.push({ id: newId, name, role: "", image: imagePath, bio });
    const updatedBase64 = Buffer.from(JSON.stringify(filtered, null, 2)).toString("base64");
    await putFile(jsonRelPath, updatedBase64, `Admin: dodaj člana ${name} (ID: ${newId})`, jsonFile.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}
