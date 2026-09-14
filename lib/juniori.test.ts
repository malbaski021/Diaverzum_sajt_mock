import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import fs from "fs";
import path from "path";
import {
  getAllJunioriPosts,
  getJunioriPostBySlug,
  getAllJunioriSlugs,
} from "./juniori";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    default: { ...actual, existsSync: vi.fn(), readdirSync: vi.fn(), readFileSync: vi.fn() },
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

const existsSyncMock = vi.mocked(fs.existsSync);
const readdirSyncMock = vi.mocked(fs.readdirSync) as unknown as Mock;
const readFileSyncMock = vi.mocked(fs.readFileSync) as unknown as Mock;

function makeDirent(name: string, isDir: boolean): fs.Dirent {
  return {
    name,
    isDirectory: () => isDir,
    isFile: () => !isDir,
    isSymbolicLink: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    parentPath: "",
    path: "",
  } as fs.Dirent;
}

const juniorMdx = (overrides: Record<string, string | boolean | undefined | string[]> = {}) => {
  const fm = {
    title: "Junior post",
    date: "2026-02-01",
    excerpt: "Kratak opis",
    author: "Autor",
    arhivirano: false,
    ...overrides,
  } as Record<string, unknown>;
  const lines = [
    "---",
    `title: "${fm.title}"`,
    `date: "${fm.date}"`,
    `excerpt: "${fm.excerpt}"`,
    `author: "${fm.author}"`,
    fm.arhivirano === true ? "arhivirano: true" : "",
    fm.image !== undefined ? `image: "${fm.image}"` : "",
    fm.coverImage !== undefined ? `coverImage: "${fm.coverImage}"` : "",
    fm.type !== undefined ? `type: "${fm.type}"` : "",
    fm.videoSrc !== undefined ? `videoSrc: "${fm.videoSrc}"` : "",
    Array.isArray(fm.tags) ? `tags: ${JSON.stringify(fm.tags)}` : "",
    "---",
    "",
    "Body sadržaj.",
  ].filter(Boolean);
  return lines.join("\n");
};

const JUNIORI = path.join(process.cwd(), "content", "juniori");
const publicJunDir = (slug: string) =>
  path.join(process.cwd(), "public", "content", "juniori", slug);

describe("getAllJunioriPosts", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća prazan niz kad ne postoji content/juniori direktorijum", () => {
    existsSyncMock.mockReturnValue(false);
    expect(getAllJunioriPosts()).toEqual([]);
  });

  it("parsira jedan post iz foldera sa MDX-om", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s === JUNIORI) return true;
      if (s === publicJunDir("test-post")) return false;
      return false;
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("folder1", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "folder1")) {
        return ["test-post.mdx"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      juniorMdx({ title: "Junior 1" }) as unknown as Buffer
    );

    const posts = getAllJunioriPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: "test-post",
      title: "Junior 1",
      type: "gallery",
      coverImage: null,
    });
  });

  it("default type je gallery kad nije postavljen", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx() as unknown as Buffer);

    const posts = getAllJunioriPosts();
    expect(posts[0].type).toBe("gallery");
  });

  it("podržava type: video sa videoSrc", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("v", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "v")) return ["vid.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      juniorMdx({ type: "video", videoSrc: "https://example.com/v.mp4" }) as unknown as Buffer
    );

    const posts = getAllJunioriPosts();
    expect(posts[0].type).toBe("video");
    expect(posts[0].videoSrc).toBe("https://example.com/v.mp4");
  });

  it("sortira post-ove po datumu silazno", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("a", true), makeDirent("b", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "a")) return ["a.mdx"] as unknown as string[];
      if (s === path.join(JUNIORI, "b")) return ["b.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith("a.mdx")) return juniorMdx({ date: "2024-01-01", title: "Stari" }) as unknown as Buffer;
      if (s.endsWith("b.mdx")) return juniorMdx({ date: "2026-12-12", title: "Novi" }) as unknown as Buffer;
      return "" as unknown as Buffer;
    });

    const posts = getAllJunioriPosts();
    expect(posts.map((p) => p.title)).toEqual(["Novi", "Stari"]);
  });

  it("filtruje arhivirane post-ove", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("aktivan", true), makeDirent("arhiv", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "aktivan")) return ["aktivan.mdx"] as unknown as string[];
      if (s === path.join(JUNIORI, "arhiv")) return ["arhiv.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith("aktivan.mdx")) return juniorMdx({ title: "Aktivan" }) as unknown as Buffer;
      if (s.endsWith("arhiv.mdx")) return juniorMdx({ title: "Arhiviran", arhivirano: true }) as unknown as Buffer;
      return "" as unknown as Buffer;
    });

    const posts = getAllJunioriPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Aktivan");
  });

  it("preskače foldere bez MDX-a", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("prazan", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "prazan")) return [] as unknown as string[];
      return [] as unknown as string[];
    });

    expect(getAllJunioriPosts()).toEqual([]);
  });

  it("ignoriše entries koji nisu direktorijumi", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("file.txt", false)] as unknown as fs.Dirent[];
      }
      return [] as unknown as string[];
    });

    expect(getAllJunioriPosts()).toEqual([]);
  });

  it("coverImage iz frontmatter.image ima prioritet", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === JUNIORI || s === publicJunDir("p");
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      if (s === publicJunDir("p")) return ["1.jpg", "2.jpg"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      juniorMdx({ image: "/iz-image.jpg" }) as unknown as Buffer
    );

    const posts = getAllJunioriPosts();
    expect(posts[0].coverImage).toBe("/iz-image.jpg");
  });

  it("coverImage iz frontmatter.coverImage kada nema image", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === JUNIORI || s === publicJunDir("p");
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      if (s === publicJunDir("p")) return ["1.jpg"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      juniorMdx({ coverImage: "/iz-cover.jpg" }) as unknown as Buffer
    );

    const posts = getAllJunioriPosts();
    expect(posts[0].coverImage).toBe("/iz-cover.jpg");
  });

  it("coverImage fallback na prvu galerijsku sliku", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === JUNIORI || s === publicJunDir("p");
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      if (s === publicJunDir("p")) return ["1.jpg", "2.jpg"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx() as unknown as Buffer);

    const posts = getAllJunioriPosts();
    expect(posts[0].coverImage).toBe("/content/juniori/p/1.jpg");
  });

  it("coverImage je null kada nema slika", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx() as unknown as Buffer);

    const posts = getAllJunioriPosts();
    expect(posts[0].coverImage).toBeNull();
  });

  it("vraća prazne stringove kada frontmatter polja nedostaju", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(`---\n---\n\nTelo.` as unknown as Buffer);

    const posts = getAllJunioriPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("");
    expect(posts[0].date).toBe("");
    expect(posts[0].excerpt).toBe("");
    expect(posts[0].author).toBe("");
    expect(posts[0].tags).toEqual([]);
    expect(posts[0].type).toBe("gallery");
  });

  it("sortira slike po numeričkom prefiksu kada postoji", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === JUNIORI || s === publicJunDir("p");
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["p.mdx"] as unknown as string[];
      if (s === publicJunDir("p")) {
        return ["10.jpg", "2.jpg", "1.jpg"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx() as unknown as Buffer);

    const posts = getAllJunioriPosts();
    expect(posts[0].images).toEqual([
      "/content/juniori/p/1.jpg",
      "/content/juniori/p/2.jpg",
      "/content/juniori/p/10.jpg",
    ]);
  });
});

describe("getJunioriPostBySlug", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća post + content po slug-u sa default vrednostima za prazan frontmatter", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["empty.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(`---\n---\n\nTelo.` as unknown as Buffer);

    const result = getJunioriPostBySlug("empty");
    expect(result).not.toBeNull();
    expect(result?.post.title).toBe("");
    expect(result?.post.date).toBe("");
    expect(result?.post.excerpt).toBe("");
    expect(result?.post.author).toBe("");
    expect(result?.post.tags).toEqual([]);
    expect(result?.post.type).toBe("gallery");
  });

  it("vraća post + content po slug-u", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["moj-post.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx({ title: "Moj" }) as unknown as Buffer);

    const result = getJunioriPostBySlug("moj-post");
    expect(result).not.toBeNull();
    expect(result?.post.title).toBe("Moj");
    expect(result?.content).toContain("Body sadržaj.");
  });

  it("vraća null kada CONTENT_DIR ne postoji", () => {
    existsSyncMock.mockReturnValue(false);
    expect(getJunioriPostBySlug("bilo-sta")).toBeNull();
  });

  it("vraća null kada slug nema match", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "f")) return ["drugo.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(juniorMdx() as unknown as Buffer);
    expect(getJunioriPostBySlug("ne-postoji")).toBeNull();
  });

  it("preskače foldere bez MDX fajla pri pretrazi", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("prazan", true), makeDirent("file.txt", false)] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "prazan")) return [] as unknown as string[];
      return [] as unknown as string[];
    });
    expect(getJunioriPostBySlug("bilo-sta")).toBeNull();
  });
});

describe("getAllJunioriSlugs", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća prazan niz kad ne postoji direktorijum", () => {
    existsSyncMock.mockReturnValue(false);
    expect(getAllJunioriSlugs()).toEqual([]);
  });

  it("vraća listu slug-ova iz svih foldera sa MDX-om", () => {
    existsSyncMock.mockImplementation((p) => String(p) === JUNIORI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === JUNIORI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [
          makeDirent("a", true),
          makeDirent("b", true),
          makeDirent("prazan", true),
        ] as unknown as fs.Dirent[];
      }
      if (s === path.join(JUNIORI, "a")) return ["alpha.mdx"] as unknown as string[];
      if (s === path.join(JUNIORI, "b")) return ["beta.mdx"] as unknown as string[];
      if (s === path.join(JUNIORI, "prazan")) return [] as unknown as string[];
      return [] as unknown as string[];
    });

    expect(getAllJunioriSlugs().sort()).toEqual(["alpha", "beta"]);
  });
});
