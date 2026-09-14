import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import fs from "fs";
import path from "path";
import {
  getAllEvents,
  getEventBySlug,
  getAllEventSlugs,
} from "./events";

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

const eventMdx = (overrides: Record<string, string | boolean | undefined> = {}) => {
  const fm: Record<string, string | boolean | undefined> = {
    title: "Test događaj",
    date: "2026-01-15",
    excerpt: "Kratak opis",
    author: "Autor",
    arhivirano: false,
    ...overrides,
  };
  const lines = [
    "---",
    `title: "${fm.title}"`,
    `date: "${fm.date}"`,
    `excerpt: "${fm.excerpt}"`,
    `author: "${fm.author}"`,
    fm.arhivirano === true ? "arhivirano: true" : "",
    fm.image !== undefined ? `image: "${fm.image}"` : "",
    fm.heroLayout !== undefined ? `heroLayout: "${fm.heroLayout}"` : "",
    fm.heroObjectPosition !== undefined ? `heroObjectPosition: "${fm.heroObjectPosition}"` : "",
    "---",
    "",
    "Body sadržaj.",
  ].filter(Boolean);
  return lines.join("\n");
};

const DOGADJAJI = path.join(process.cwd(), "content", "dogadjaji");
const publicDogDir = (slug: string) =>
  path.join(process.cwd(), "public", "content", "dogadjaji", slug);

describe("getAllEvents", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća prazan niz kad ne postoji content/dogadjaji direktorijum", () => {
    existsSyncMock.mockImplementation((p) => p !== DOGADJAJI);
    expect(getAllEvents()).toEqual([]);
  });

  it("parsira jedan event sa MDX fajlom u folderu", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s === DOGADJAJI) return true;
      if (s === publicDogDir("dogadjaj-1")) return false;
      return false;
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("folder1", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "folder1")) {
        return ["dogadjaj-1.mdx"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(eventMdx({ title: "Prvi" }) as unknown as Buffer);

    const events = getAllEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      slug: "dogadjaj-1",
      title: "Prvi",
      date: "2026-01-15",
      folderName: "folder1",
      images: [],
    });
  });

  it("sortira event-e po datumu silazno", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("a", true), makeDirent("b", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "a")) return ["a.mdx"] as unknown as string[];
      if (s === path.join(DOGADJAJI, "b")) return ["b.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith("a.mdx")) return eventMdx({ date: "2025-01-01", title: "Stariji" }) as unknown as Buffer;
      if (s.endsWith("b.mdx")) return eventMdx({ date: "2026-06-01", title: "Noviji" }) as unknown as Buffer;
      return "" as unknown as Buffer;
    });

    const events = getAllEvents();
    expect(events.map((e) => e.title)).toEqual(["Noviji", "Stariji"]);
  });

  it("filtruje arhivirane događaje (arhivirano: true)", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("aktivan", true), makeDirent("arhiviran", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "aktivan")) return ["aktivan.mdx"] as unknown as string[];
      if (s === path.join(DOGADJAJI, "arhiviran")) return ["arhiviran.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith("aktivan.mdx")) return eventMdx({ title: "Aktivan" }) as unknown as Buffer;
      if (s.endsWith("arhiviran.mdx")) return eventMdx({ title: "Arhiviran", arhivirano: true }) as unknown as Buffer;
      return "" as unknown as Buffer;
    });

    const events = getAllEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Aktivan");
  });

  it("preskače foldere bez MDX fajla", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("prazan", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "prazan")) return ["text.txt"] as unknown as string[];
      return [] as unknown as string[];
    });

    expect(getAllEvents()).toEqual([]);
  });

  it("ignoriše entries koji nisu direktorijumi", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("file.mdx", false)] as unknown as fs.Dirent[];
      }
      return [] as unknown as string[];
    });

    expect(getAllEvents()).toEqual([]);
  });

  it("uključuje slike iz public/content/dogadjaji/{slug} sortirane po broju", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s === DOGADJAJI) return true;
      if (s === publicDogDir("foto")) return true;
      return false;
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("event-foto", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "event-foto")) {
        return ["foto.mdx"] as unknown as string[];
      }
      if (s === publicDogDir("foto")) {
        return ["2.jpg", "10.jpg", "1.jpg", "readme.txt"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(eventMdx() as unknown as Buffer);

    const events = getAllEvents();
    expect(events[0].images).toEqual([
      "/content/dogadjaji/foto/1.jpg",
      "/content/dogadjaji/foto/2.jpg",
      "/content/dogadjaji/foto/10.jpg",
    ]);
  });

  it("postavlja frontmatter image kao prvu sliku u nizu", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s === DOGADJAJI) return true;
      if (s === publicDogDir("hero")) return true;
      return false;
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("h", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "h")) return ["hero.mdx"] as unknown as string[];
      if (s === publicDogDir("hero")) {
        return ["1.jpg", "2.jpg", "3.jpg"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      eventMdx({ image: "/content/dogadjaji/hero/3.jpg" }) as unknown as Buffer
    );

    const events = getAllEvents();
    expect(events[0].images[0]).toBe("/content/dogadjaji/hero/3.jpg");
    expect(events[0].images).toHaveLength(3);
  });

  it("vraća prazne stringove kada frontmatter polja nedostaju", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "f")) return ["e.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    // MDX bez ijednog polja u frontmatter-u
    readFileSyncMock.mockReturnValue(`---\n---\n\nSamo telo.` as unknown as Buffer);

    const events = getAllEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("");
    expect(events[0].date).toBe("");
    expect(events[0].excerpt).toBe("");
    expect(events[0].author).toBe("");
    expect(events[0].heroLayout).toBeUndefined();
    expect(events[0].heroObjectPosition).toBeUndefined();
  });

  it("ignoriše frontmatter image kada nije u listi public slika", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === DOGADJAJI || s === publicDogDir("foto");
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("event-foto", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "event-foto")) return ["foto.mdx"] as unknown as string[];
      if (s === publicDogDir("foto")) return ["1.jpg", "2.jpg"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(
      eventMdx({ image: "/nije/u/listi.jpg" }) as unknown as Buffer
    );

    const events = getAllEvents();
    // image nije u rawImages, pa images niz ostaje nepromenjen
    expect(events[0].images).toEqual([
      "/content/dogadjaji/foto/1.jpg",
      "/content/dogadjaji/foto/2.jpg",
    ]);
  });

  it("sortira alfabetski kada nazivi slika nisu brojevi", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      if (s === DOGADJAJI) return true;
      if (s === publicDogDir("foto")) return true;
      return false;
    });
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("event-foto", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "event-foto")) {
        return ["foto.mdx"] as unknown as string[];
      }
      if (s === publicDogDir("foto")) {
        return ["beta.jpg", "alpha.jpg"] as unknown as string[];
      }
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(eventMdx() as unknown as Buffer);

    const events = getAllEvents();
    expect(events[0].images).toEqual([
      "/content/dogadjaji/foto/alpha.jpg",
      "/content/dogadjaji/foto/beta.jpg",
    ]);
  });
});

describe("getEventBySlug", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća event sa odgovarajućim slug-om", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("f", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "f")) return ["my-event.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(eventMdx({ title: "Moj događaj" }) as unknown as Buffer);

    const event = getEventBySlug("my-event");
    expect(event).not.toBeNull();
    expect(event?.title).toBe("Moj događaj");
  });

  it("vraća null kad slug ne postoji", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [] as unknown as fs.Dirent[];
      }
      return [] as unknown as string[];
    });
    expect(getEventBySlug("ne-postoji")).toBeNull();
  });
});

describe("getAllEventSlugs", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readdirSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("vraća listu svih slug-ova", () => {
    existsSyncMock.mockImplementation((p) => String(p) === DOGADJAJI);
    readdirSyncMock.mockImplementation((dir, opts?: unknown) => {
      const s = String(dir);
      if (s === DOGADJAJI && opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return [makeDirent("a", true), makeDirent("b", true)] as unknown as fs.Dirent[];
      }
      if (s === path.join(DOGADJAJI, "a")) return ["alpha.mdx"] as unknown as string[];
      if (s === path.join(DOGADJAJI, "b")) return ["beta.mdx"] as unknown as string[];
      return [] as unknown as string[];
    });
    readFileSyncMock.mockReturnValue(eventMdx() as unknown as Buffer);

    const slugs = getAllEventSlugs();
    expect(slugs.sort()).toEqual(["alpha", "beta"]);
  });
});
