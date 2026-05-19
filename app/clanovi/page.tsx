import type { Metadata } from "next";
import Link from "next/link";
import MemberImage from "@/components/MemberImage";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Članovi",
  description: "Upoznajte članove udruženja Diaverzum Novi Sad.",
};

const DEFAULT_IMAGE = "/content/clanovi/default.jpg";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "develop";
const GITHUB_API = "https://api.github.com";
const IS_LOCAL = process.env.NODE_ENV === "development";

interface ClanMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  arhivirano?: boolean;
}

async function getMembers(): Promise<ClanMember[]> {
  const jsonRelPath = "content/clanovi/clanovi.json";

  if (IS_LOCAL) {
    const filePath = path.join(process.cwd(), jsonRelPath);
    const raw = fs.readFileSync(filePath, "utf-8");
    const members = JSON.parse(raw) as ClanMember[];
    return members.map((m) => {
      const publicPath = path.join(process.cwd(), "public", m.image);
      const imageExists = m.image && fs.existsSync(publicPath);
      return { ...m, image: imageExists ? m.image : DEFAULT_IMAGE };
    });
  }

  // Production: fetch from GitHub API for always-fresh data
  const encodePath = (p: string) => p.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(jsonRelPath)}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  const members = JSON.parse(decoded) as ClanMember[];
  return members.map((m) => ({ ...m, image: m.image || DEFAULT_IMAGE }));
}

export default async function ClanoviPage() {
  const members = (await getMembers()).filter((m) => m.name.trim() !== "" && !m.arhivirano);

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Članovi</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-gray-900 mb-4">Naši članovi</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Upoznajte ljude koji čine Diaverzum Novi Sad — tim posvećen
            poboljšanju kvaliteta života sa dijabetesom.
          </p>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <article key={member.name} className="card overflow-hidden">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-blue-light">
                <MemberImage src={member.image} alt={`Fotografija: ${member.name}`} />
              </div>
              <div className="p-4">
                {member.role && (
                  <p className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">
                    {member.role}
                  </p>
                )}
                <h2 className="text-base font-bold text-gray-900 mb-2">{member.name}</h2>
                {member.bio && (
                  <p className="text-gray-500 text-sm leading-relaxed text-justify">{member.bio}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 bg-brand-blue-light rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Postani član</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Pridruži se zajednici Diaverzum Novi Sad i dobij pristup svim
            programima, edukacijama i grupama podrške.
          </p>
          <Link href="/kontakt" className="btn-primary">
            Kontaktiraj nas
          </Link>
        </div>
      </div>
    </div>
  );
}
