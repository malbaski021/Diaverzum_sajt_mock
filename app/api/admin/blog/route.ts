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
): string {
  const lines = [
    `---`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `author: "${author.replace(/"/g, '\\"')}"`,
    `tags: ${JSON.stringify(tags)}`,
    `heroLayout: "${heroLayout}"`,
    `---`,
    ``,
  ];
  return lines.join("\n");
}

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

// --- Handler ---

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const author = (formData.get("author") as string)?.trim() ?? "";
    const date = (formData.get("date") as string)?.trim() ?? new Date().toISOString().split("T")[0];
    const text = (formData.get("text") as string)?.trim() ?? "";
    const heroLayout = (formData.get("heroLayout") as string) ?? "top";
    const tags: string[] = JSON.parse((formData.get("tags") as string) ?? "[]");
    const mainImage = formData.get("mainImage") as File | null;
    const galleryFiles = formData.getAll("gallery") as File[];

    if (!title) {
      return NextResponse.json({ error: "Naslov je obavezan." }, { status: 400 });
    }

    const slug = toSlug(title);
    const folderName = title;
    const excerpt = text.slice(0, 160).replace(/\n/g, " ").trim();
    const mdxContent = buildMdx(title, date, excerpt, author, tags, heroLayout) + text;

    const allImages: { file: File; index: number }[] = [];
    if (mainImage && mainImage.size > 0) allImages.push({ file: mainImage, index: 1 });
    galleryFiles
      .filter((f) => f.size > 0)
      .forEach((f, i) => allImages.push({ file: f, index: i + 2 }));

    if (IS_LOCAL) {
      const contentFolder = `content/blog/${folderName}`;
      const publicFolder = `public/content/blog/${slug}`;

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
    const mdxPath = `content/blog/${folderName}/${slug}.mdx`;
    const mdxSha = await getFileSha(mdxPath);
    await putFile(mdxPath, Buffer.from(mdxContent).toString("base64"), `Admin: dodaj blog "${title}"`, mdxSha);

    for (const { file, index } of allImages) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${index}.${ext}`;
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      const contentImgPath = `content/blog/${folderName}/${filename}`;
      const publicImgPath = `public/content/blog/${slug}/${filename}`;

      const contentSha = await getFileSha(contentImgPath);
      await putFile(contentImgPath, base64, `Admin: dodaj sliku za blog "${title}"`, contentSha);

      const publicSha = await getFileSha(publicImgPath);
      await putFile(publicImgPath, base64, `Admin: dodaj sliku za blog "${title}"`, publicSha);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}
