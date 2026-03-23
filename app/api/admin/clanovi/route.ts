import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "develop";

const GITHUB_API = "https://api.github.com";

// Enkodira samo segmente putanje (ne i slash-eve)
function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function getFileSha(path: string): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

async function putFile(path: string, base64Content: string, message: string, sha?: string | null) {
  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}`,
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

async function getFileContent(path: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string)?.trim();
    const bio = (formData.get("bio") as string)?.trim() ?? "";
    const image = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Ime je obavezno." }, { status: 400 });
    }

    let imagePath = "";

    // Upload slike ako postoji
    if (image && image.size > 0) {
      const ext = image.name.split(".").pop() ?? "jpg";
      const filename = `${name}.${ext}`;
      const arrayBuffer = await image.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const publicPath = `public/content/clanovi/${filename}`;
      const contentPath = `content/clanovi/${filename}`;

      const publicSha = await getFileSha(publicPath);
      await putFile(publicPath, base64, `Admin: dodaj sliku za ${name}`, publicSha);

      const contentSha = await getFileSha(contentPath);
      await putFile(contentPath, base64, `Admin: dodaj sliku za ${name}`, contentSha);

      imagePath = `/content/clanovi/${filename}`;
    }

    // Pročitaj i ažuriraj clanovi.json
    const jsonPath = "content/clanovi/clanovi.json";
    const jsonFile = await getFileContent(jsonPath);
    if (!jsonFile) {
      return NextResponse.json({ error: "Ne mogu da učitam clanovi.json." }, { status: 500 });
    }

    const decoded = Buffer.from(jsonFile.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const members = JSON.parse(decoded) as { name: string; role: string; image: string; bio: string }[];

    // Ukloni prazan placeholder na kraju ako postoji
    const filtered = members.filter((m) => m.name.trim() !== "");

    filtered.push({ name, role: "", image: imagePath, bio });

    const updatedBase64 = Buffer.from(JSON.stringify(filtered, null, 2)).toString("base64");
    await putFile(jsonPath, updatedBase64, `Admin: dodaj člana ${name}`, jsonFile.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}
