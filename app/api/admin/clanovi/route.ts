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

async function deleteFile(filePath: string, message: string, sha: string) {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(filePath)}`,
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
    throw new Error(`GitHub API error deleting ${filePath}: ${JSON.stringify(err)}`);
  }
}

// --- Lokalne (filesystem) operacije ---

const ROOT = process.cwd();

interface ClanMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  arhivirano?: boolean;
}

function localReadJson(relPath: string): ClanMember[] {
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

function localDeleteFile(relPath: string) {
  const abs = path.join(ROOT, relPath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
}

// --- GET ---

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const jsonRelPath = "content/clanovi/clanovi.json";

  try {
    if (IS_LOCAL) {
      const members = localReadJson(jsonRelPath);
      if (id) {
        const member = members.find((m) => m.id === parseInt(id));
        if (!member) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });
        return NextResponse.json(member);
      }
      return NextResponse.json({ items: members.filter((m) => m.name?.trim() !== "") });
    }

    const jsonFile = await getFileContent(jsonRelPath);
    if (!jsonFile) return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });
    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as ClanMember[];
    if (id) {
      const member = members.find((m) => m.id === parseInt(id));
      if (!member) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });
      return NextResponse.json(member);
    }
    return NextResponse.json({ items: members.filter((m) => m.name?.trim() !== "") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri učitavanju." }, { status: 500 });
  }
}

// --- POST (dodaj novog) ---

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
      const members = localReadJson(jsonRelPath);
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

      filtered.push({ id: newId, name, role: "", image: imagePath, bio, arhivirano: false });
      localWriteJson(jsonRelPath, filtered);

      return NextResponse.json({ success: true });
    }

    // Produkcijski mod — GitHub API
    const jsonFile = await getFileContent(jsonRelPath);
    if (!jsonFile) {
      return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });
    }

    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as ClanMember[];
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

    filtered.push({ id: newId, name, role: "", image: imagePath, bio, arhivirano: false });
    const updatedBase64 = Buffer.from(JSON.stringify(filtered, null, 2)).toString("base64");
    await putFile(jsonRelPath, updatedBase64, `Admin: dodaj člana ${name} (ID: ${newId})`, jsonFile.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}

// --- PUT (izmena podataka, opciona zamena slike) ---

export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let id: number, name: string, bio: string, arhivirano: boolean, image: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      id = parseInt(fd.get("id") as string);
      name = ((fd.get("name") as string) ?? "").trim();
      bio = ((fd.get("bio") as string) ?? "").trim();
      arhivirano = (fd.get("arhivirano") as string) === "true";
      image = fd.get("image") as File | null;
    } else {
      const body = await req.json() as { id: number; name: string; bio: string; arhivirano: boolean };
      id = body.id;
      name = (body.name ?? "").trim();
      bio = (body.bio ?? "").trim();
      arhivirano = body.arhivirano;
    }

    if (!id) return NextResponse.json({ error: "ID je obavezan." }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Ime je obavezno." }, { status: 400 });

    const jsonRelPath = "content/clanovi/clanovi.json";

    if (IS_LOCAL) {
      const members = localReadJson(jsonRelPath);
      const idx = members.findIndex((m) => m.id === id);
      if (idx === -1) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });

      let imagePath = members[idx].image;

      if (image && image.size > 0) {
        const buffer = Buffer.from(await image.arrayBuffer());
        if (imagePath) {
          // Zameni staru sliku — isti naziv fajla
          const filename = path.basename(imagePath);
          localWriteImage(`public/content/clanovi/${filename}`, buffer);
          localWriteImage(`content/clanovi/${filename}`, buffer);
        } else {
          // Nema prethodne slike — napravi novu
          const ext = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const filename = `${name} ${id}.${ext}`;
          localWriteImage(`public/content/clanovi/${filename}`, buffer);
          localWriteImage(`content/clanovi/${filename}`, buffer);
          imagePath = `/content/clanovi/${filename}`;
        }
      }

      members[idx] = { ...members[idx], name, bio, arhivirano, image: imagePath };
      localWriteJson(jsonRelPath, members);
      return NextResponse.json({ success: true });
    }

    const jsonFile = await getFileContent(jsonRelPath);
    if (!jsonFile) return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });

    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as ClanMember[];
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });

    let imagePath = members[idx].image;

    if (image && image.size > 0) {
      const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
      if (imagePath) {
        const filename = path.basename(imagePath);
        const publicPath = `public/content/clanovi/${filename}`;
        const contentPath = `content/clanovi/${filename}`;
        const publicSha = await getFileSha(publicPath);
        await putFile(publicPath, base64, `Admin: zameni sliku za ${name}`, publicSha);
        const contentSha = await getFileSha(contentPath);
        await putFile(contentPath, base64, `Admin: zameni sliku za ${name}`, contentSha);
      } else {
        const ext = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${name} ${id}.${ext}`;
        const publicPath = `public/content/clanovi/${filename}`;
        const contentPath = `content/clanovi/${filename}`;
        const publicSha = await getFileSha(publicPath);
        await putFile(publicPath, base64, `Admin: dodaj sliku za ${name}`, publicSha);
        const contentSha = await getFileSha(contentPath);
        await putFile(contentPath, base64, `Admin: dodaj sliku za ${name}`, contentSha);
        imagePath = `/content/clanovi/${filename}`;
      }
    }

    members[idx] = { ...members[idx], name, bio, arhivirano, image: imagePath };
    const updatedBase64 = Buffer.from(JSON.stringify(members, null, 2)).toString("base64");
    await putFile(jsonRelPath, updatedBase64, `Admin: izmeni člana ${name} (ID: ${id})`, jsonFile.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri čuvanju." }, { status: 500 });
  }
}

// --- DELETE ---

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json() as { id: number };
    const { id } = body;

    if (!id) return NextResponse.json({ error: "ID je obavezan." }, { status: 400 });

    const jsonRelPath = "content/clanovi/clanovi.json";

    if (IS_LOCAL) {
      const members = localReadJson(jsonRelPath);
      const member = members.find((m) => m.id === id);
      if (!member) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });

      // Obriši sliku
      if (member.image) {
        const imgFilename = path.basename(member.image);
        localDeleteFile(`content/clanovi/${imgFilename}`);
        localDeleteFile(`public/content/clanovi/${imgFilename}`);
      }

      const updated = members.filter((m) => m.id !== id);
      localWriteJson(jsonRelPath, updated);
      return NextResponse.json({ success: true });
    }

    // GitHub mode
    const jsonFile = await getFileContent(jsonRelPath);
    if (!jsonFile) return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });

    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as ClanMember[];
    const member = members.find((m) => m.id === id);
    if (!member) return NextResponse.json({ error: "Član nije pronađen." }, { status: 404 });

    // Obriši slike na GitHubu
    if (member.image) {
      const imgFilename = path.basename(member.image);
      const publicPath = `public/content/clanovi/${imgFilename}`;
      const contentPath = `content/clanovi/${imgFilename}`;

      const publicSha = await getFileSha(publicPath);
      if (publicSha) await deleteFile(publicPath, `Admin: obriši sliku člana ID ${id}`, publicSha);

      const contentSha = await getFileSha(contentPath);
      if (contentSha) await deleteFile(contentPath, `Admin: obriši sliku člana ID ${id}`, contentSha);
    }

    const updated = members.filter((m) => m.id !== id);
    const updatedBase64 = Buffer.from(JSON.stringify(updated, null, 2)).toString("base64");
    await putFile(jsonRelPath, updatedBase64, `Admin: obriši člana ID ${id}`, jsonFile.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri brisanju." }, { status: 500 });
  }
}
