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

function buildMdx(
  title: string,
  date: string,
  excerpt: string,
  author: string,
  tags: string[],
  heroLayout: string,
  arhivirano: boolean = false,
): string {
  const lines = [
    `---`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `author: "${author.replace(/"/g, '\\"')}"`,
    `tags: ${JSON.stringify(tags)}`,
    `heroLayout: "${heroLayout}"`,
    `arhivirano: ${arhivirano}`,
    `---`,
    ``,
  ];
  return lines.join("\n");
}

function enc(p: string): string { return p.split("/").map(encodeURIComponent).join("/"); }

// --- GitHub helpers ---

async function getFileSha(filePath: string): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

async function putFile(filePath: string, base64Content: string, message: string, sha?: string | null) {
  const body: Record<string, unknown> = { message, content: base64Content, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`,
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

// --- Local helpers ---

function localWrite(relPath: string, buffer: Buffer) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buffer);
}

function localWriteText(relPath: string, content: string) {
  localWrite(relPath, Buffer.from(content, "utf-8"));
}

// --- Frontmatter parser ---

function parseFrontmatter(content: string): Record<string, string> {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(": ");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 2).replace(/^"|"$/g, "").trim();
    fm[key] = val;
  }
  return fm;
}

// --- GitHub list helper ---

async function listGitHubDogadjaji() {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const rootRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/dogadjaji?ref=${GITHUB_BRANCH}`,
    { headers }
  );
  if (!rootRes.ok) return [];
  const entries: { name: string; type: string }[] = await rootRes.json();

  const items: { folder: string; slug: string; title: string; date: string; author: string; excerpt: string; arhivirano: boolean }[] = [];

  for (const entry of entries.filter((e) => e.type === "dir")) {
    const folderRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(`content/dogadjaji/${entry.name}`)}?ref=${GITHUB_BRANCH}`,
      { headers }
    );
    if (!folderRes.ok) continue;
    const files: { name: string; download_url: string }[] = await folderRes.json();
    const mdxFile = files.find((f) => f.name.endsWith(".mdx"));
    if (!mdxFile) continue;

    const mdxRes = await fetch(mdxFile.download_url);
    if (!mdxRes.ok) continue;
    const content = await mdxRes.text();
    const fm = parseFrontmatter(content);

    items.push({
      folder: entry.name,
      slug: mdxFile.name.replace(".mdx", ""),
      title: fm.title ?? entry.name,
      date: fm.date ?? "",
      author: fm.author ?? "",
      excerpt: fm.excerpt ?? "",
      arhivirano: fm.arhivirano === "true",
    });
  }

  return items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

// --- Handler ---

function extractBody(content: string): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return match ? match[1].trim() : normalized.trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const slug   = searchParams.get("slug");

    // --- Jedan događaj (za edit) ---
    if (folder && slug) {
      const mdxRelPath = `content/dogadjaji/${folder}/${slug}.mdx`;

      if (IS_LOCAL) {
        const abs = path.join(ROOT, mdxRelPath);
        if (!fs.existsSync(abs)) return NextResponse.json({ error: "Ne postoji." }, { status: 404 });
        const raw = fs.readFileSync(abs, "utf-8");
        const fm  = parseFrontmatter(raw);
        const body = extractBody(raw);
        const tags = fm.tags ? JSON.parse(fm.tags.replace(/'/g, '"')) : [];
        return NextResponse.json({ folder, slug, title: fm.title ?? "", date: fm.date ?? "", author: fm.author ?? "", heroLayout: fm.heroLayout ?? "top", tags, arhivirano: fm.arhivirano === "true", text: body });
      }

      // GitHub
      const headers = { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };
      const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(mdxRelPath)}?ref=${GITHUB_BRANCH}`, { headers });
      if (!res.ok) return NextResponse.json({ error: "Ne postoji." }, { status: 404 });
      const fileData = await res.json();
      const raw = Buffer.from(fileData.content.replace(/\n/g, ""), "base64").toString("utf-8");
      const fm  = parseFrontmatter(raw);
      const body = extractBody(raw);
      const tags = fm.tags ? JSON.parse(fm.tags.replace(/'/g, '"')) : [];
      return NextResponse.json({ folder, slug, sha: fileData.sha, title: fm.title ?? "", date: fm.date ?? "", author: fm.author ?? "", heroLayout: fm.heroLayout ?? "top", tags, arhivirano: fm.arhivirano === "true", text: body });
    }

    // --- Lista svih događaja ---
    if (IS_LOCAL) {
      const dogadjajiDir = path.join(ROOT, "content/dogadjaji");
      if (!fs.existsSync(dogadjajiDir)) return NextResponse.json({ items: [] });

      const items: { folder: string; slug: string; title: string; date: string; author: string; excerpt: string; arhivirano: boolean }[] = [];

      for (const entry of fs.readdirSync(dogadjajiDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const folderPath = path.join(dogadjajiDir, entry.name);
        const mdxFile = fs.readdirSync(folderPath).find((f) => f.endsWith(".mdx"));
        if (!mdxFile) continue;

        const content = fs.readFileSync(path.join(folderPath, mdxFile), "utf-8");
        const fm = parseFrontmatter(content);

        items.push({
          folder: entry.name,
          slug: mdxFile.replace(".mdx", ""),
          title: fm.title ?? entry.name,
          date: fm.date ?? "",
          author: fm.author ?? "",
          excerpt: fm.excerpt ?? "",
          arhivirano: fm.arhivirano === "true",
        });
      }

      items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
      return NextResponse.json({ items });
    }

    const items = await listGitHubDogadjaji();
    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri učitavanju." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { folder, slug, title, author, date, text, heroLayout, tags, sha, arhivirano } = await req.json();
    if (!folder || !slug || !title) return NextResponse.json({ error: "folder, slug i title su obavezni." }, { status: 400 });

    const excerpt    = (text ?? "").slice(0, 160).replace(/\n/g, " ").trim();
    const mdxContent = buildMdx(title, date ?? "", excerpt, author ?? "", tags ?? [], heroLayout ?? "top", arhivirano ?? false) + (text ?? "");
    const mdxRelPath = `content/dogadjaji/${folder}/${slug}.mdx`;

    if (IS_LOCAL) {
      fs.writeFileSync(path.join(ROOT, mdxRelPath), mdxContent, "utf-8");
      return NextResponse.json({ success: true });
    }

    // GitHub — potreban SHA za update
    const fileSha = sha ?? (await getFileSha(mdxRelPath));
    await putFile(mdxRelPath, Buffer.from(mdxContent).toString("base64"), `Admin: izmeni događaj "${title}"`, fileSha);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri čuvanju." }, { status: 500 });
  }
}

async function deleteGitHubFolder(folderPath: string, folderLabel: string) {
  const ghHeaders = { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(folderPath)}?ref=${GITHUB_BRANCH}`,
    { headers: ghHeaders }
  );
  if (!res.ok) return;
  const files: { name: string; path: string; sha: string; type: string }[] = await res.json();
  for (const file of files.filter((f) => f.type === "file")) {
    await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${enc(file.path)}`,
      {
        method: "DELETE",
        headers: { ...ghHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Admin: obriši događaj "${folderLabel}"`, sha: file.sha, branch: GITHUB_BRANCH }),
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { folder, slug } = await req.json();
    if (!folder || !slug) return NextResponse.json({ error: "folder i slug su obavezni." }, { status: 400 });

    const contentFolder = `content/dogadjaji/${folder}`;
    const publicFolder  = `public/content/dogadjaji/${slug}`;

    if (IS_LOCAL) {
      const contentAbs = path.join(ROOT, contentFolder);
      const publicAbs  = path.join(ROOT, publicFolder);
      if (fs.existsSync(contentAbs)) fs.rmSync(contentAbs, { recursive: true, force: true });
      if (fs.existsSync(publicAbs))  fs.rmSync(publicAbs,  { recursive: true, force: true });
      return NextResponse.json({ success: true });
    }

    await deleteGitHubFolder(contentFolder, folder);
    await deleteGitHubFolder(publicFolder, folder);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri brisanju." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const author = (formData.get("author") as string)?.trim() || "Diaverzum Novi Sad";
    const date = (formData.get("date") as string)?.trim() ?? new Date().toISOString().split("T")[0];
    const text = (formData.get("text") as string)?.trim() ?? "";
    const heroLayout = (formData.get("heroLayout") as string) ?? "top";
    const tags: string[] = JSON.parse((formData.get("tags") as string) ?? "[]");
    const arhivirano = (formData.get("arhivirano") as string) === "true";
    const mainImage = formData.get("mainImage") as File | null;
    const galleryFiles = formData.getAll("gallery") as File[];

    if (!title) {
      return NextResponse.json({ error: "Naslov je obavezan." }, { status: 400 });
    }

    const slug = toSlug(title);

    if (!slug) {
      return NextResponse.json({ error: "Naslov mora sadržati bar jedno slovo ili broj." }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png"];
    const MAX_BYTES = 5 * 1024 * 1024;
    for (const { file } of [
      ...(mainImage && mainImage.size > 0 ? [{ file: mainImage }] : []),
      ...galleryFiles.filter((f) => f.size > 0).map((f) => ({ file: f })),
    ]) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Slika "${file.name}" nije dozvoljen format. Dozvoljeni su samo JPG i PNG.` }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: `Slika "${file.name}" je prevelika (max 5 MB).` }, { status: 400 });
      }
    }
    const folderName = title;
    const excerpt = text.slice(0, 160).replace(/\n/g, " ").trim();
    const mdxContent = buildMdx(title, date, excerpt, author, tags, heroLayout, arhivirano) + text;

    const allImages: { file: File; index: number }[] = [];
    if (mainImage && mainImage.size > 0) allImages.push({ file: mainImage, index: 1 });
    galleryFiles
      .filter((f) => f.size > 0)
      .forEach((f, i) => allImages.push({ file: f, index: i + 2 }));

    // Provera duplikata
    if (IS_LOCAL) {
      if (fs.existsSync(path.join(ROOT, `content/dogadjaji/${folderName}`))) {
        return NextResponse.json({ error: `Događaj sa naslovom "${title}" već postoji.` }, { status: 409 });
      }
    } else {
      const existingSha = await getFileSha(`content/dogadjaji/${folderName}/${slug}.mdx`);
      if (existingSha) {
        return NextResponse.json({ error: `Događaj sa naslovom "${title}" već postoji.` }, { status: 409 });
      }
    }

    if (IS_LOCAL) {
      const contentFolder = `content/dogadjaji/${folderName}`;
      const publicFolder = `public/content/dogadjaji/${slug}`;

      // Write MDX
      localWriteText(`${contentFolder}/${slug}.mdx`, mdxContent);

      // Write images
      for (const { file, index } of allImages) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${index}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        localWrite(`${contentFolder}/${filename}`, buffer);
        localWrite(`${publicFolder}/${filename}`, buffer);
      }

      return NextResponse.json({ success: true });
    }

    // Production — GitHub API
    const mdxPath = `content/dogadjaji/${folderName}/${slug}.mdx`;
    const mdxSha = await getFileSha(mdxPath);
    await putFile(mdxPath, Buffer.from(mdxContent).toString("base64"), `Admin: dodaj događaj "${title}"`, mdxSha);

    for (const { file, index } of allImages) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${index}.${ext}`;
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      const contentImgPath = `content/dogadjaji/${folderName}/${filename}`;
      const publicImgPath = `public/content/dogadjaji/${slug}/${filename}`;

      const contentSha = await getFileSha(contentImgPath);
      await putFile(contentImgPath, base64, `Admin: dodaj sliku za događaj "${title}"`, contentSha);

      const publicSha = await getFileSha(publicImgPath);
      await putFile(publicImgPath, base64, `Admin: dodaj sliku za događaj "${title}"`, publicSha);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}
