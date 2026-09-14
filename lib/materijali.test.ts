import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import fs from "fs";
import path from "path";
import {
  getMaterijali,
  getActiveMaterijali,
  getMaterijalTitle,
  MATERIJAL_EXTENSIONS,
} from "./materijali";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    default: { ...actual, existsSync: vi.fn(), readFileSync: vi.fn(), readdirSync: vi.fn() },
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

const existsSyncMock = vi.mocked(fs.existsSync);
const readFileSyncMock = vi.mocked(fs.readFileSync) as unknown as Mock;
const readdirSyncMock = vi.mocked(fs.readdirSync) as unknown as Mock;

const META_PATH = path.join(process.cwd(), "content", "o-dijabetesu", "materijali.json");
const FILES_DIR = path.join(process.cwd(), "public", "content", "materijal");

beforeEach(() => {
  existsSyncMock.mockReset();
  readFileSyncMock.mockReset();
  readdirSyncMock.mockReset();
});

describe("MATERIJAL_EXTENSIONS", () => {
  it("prepoznaje PDF, DOC, DOCX, XLS, XLSX (case-insensitive)", () => {
    expect(MATERIJAL_EXTENSIONS.test("file.pdf")).toBe(true);
    expect(MATERIJAL_EXTENSIONS.test("file.PDF")).toBe(true);
    expect(MATERIJAL_EXTENSIONS.test("file.doc")).toBe(true);
    expect(MATERIJAL_EXTENSIONS.test("file.docx")).toBe(true);
    expect(MATERIJAL_EXTENSIONS.test("file.xls")).toBe(true);
    expect(MATERIJAL_EXTENSIONS.test("file.xlsx")).toBe(true);
  });

  it("odbija ne-podržane ekstenzije", () => {
    expect(MATERIJAL_EXTENSIONS.test("file.txt")).toBe(false);
    expect(MATERIJAL_EXTENSIONS.test("file.png")).toBe(false);
    expect(MATERIJAL_EXTENSIONS.test("file")).toBe(false);
  });
});

describe("getMaterijalTitle", () => {
  it("uklanja .pdf ekstenziju", () => {
    expect(getMaterijalTitle("Ishrana.pdf")).toBe("Ishrana");
  });

  it("uklanja .docx ekstenziju case-insensitive", () => {
    expect(getMaterijalTitle("Plan.DOCX")).toBe("Plan");
  });

  it("uklanja .xlsx ekstenziju", () => {
    expect(getMaterijalTitle("Budžet.xlsx")).toBe("Budžet");
  });

  it("vraća isto ime ako nema poznate ekstenzije", () => {
    expect(getMaterijalTitle("readme")).toBe("readme");
  });
});

describe("getMaterijali", () => {
  it("vraća parsiran JSON kada metadata fajl postoji", () => {
    existsSyncMock.mockImplementation((p) => String(p) === META_PATH);
    readFileSyncMock.mockReturnValue(
      JSON.stringify([
        { file: "Ishrana.pdf", archived: false },
        { file: "Stari.pdf", archived: true },
      ]) as unknown as Buffer
    );

    const items = getMaterijali();
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ file: "Ishrana.pdf", archived: false });
    expect(items[1]).toEqual({ file: "Stari.pdf", archived: true });
  });

  it("auto-seed iz folder-a kada metadata ne postoji", () => {
    existsSyncMock.mockImplementation((p) => String(p) === FILES_DIR);
    readdirSyncMock.mockImplementation((dir) => {
      if (String(dir) === FILES_DIR) {
        return ["Ishrana.pdf", "readme.txt", "Plan.docx"] as unknown as string[];
      }
      return [] as unknown as string[];
    });

    const items = getMaterijali();
    expect(items.map((m) => m.file).sort()).toEqual(["Ishrana.pdf", "Plan.docx"]);
    expect(items.every((m) => m.archived === false)).toBe(true);
  });

  it("vraća prazan niz kada ni meta ni folder ne postoje", () => {
    existsSyncMock.mockReturnValue(false);
    expect(getMaterijali()).toEqual([]);
  });

  it("ignoriše ne-podržane ekstenzije pri seed-u", () => {
    existsSyncMock.mockImplementation((p) => String(p) === FILES_DIR);
    readdirSyncMock.mockReturnValue([
      "ok.pdf",
      "image.png",
      "doc.docx",
      "video.mp4",
    ] as unknown as string[]);

    const items = getMaterijali();
    expect(items.map((m) => m.file).sort()).toEqual(["doc.docx", "ok.pdf"]);
  });

  it("sortira fajlove alfabetski pri seed-u", () => {
    existsSyncMock.mockImplementation((p) => String(p) === FILES_DIR);
    readdirSyncMock.mockReturnValue([
      "Zeta.pdf",
      "Alpha.pdf",
      "Mu.pdf",
    ] as unknown as string[]);

    const items = getMaterijali();
    expect(items.map((m) => m.file)).toEqual(["Alpha.pdf", "Mu.pdf", "Zeta.pdf"]);
  });

  it("fallback na seed kada je JSON nevalidan", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === META_PATH || s === FILES_DIR;
    });
    readFileSyncMock.mockReturnValue("not valid json {" as unknown as Buffer);
    readdirSyncMock.mockReturnValue(["X.pdf"] as unknown as string[]);

    const items = getMaterijali();
    expect(items).toEqual([{ file: "X.pdf", archived: false }]);
  });

  it("fallback na seed kada JSON nije niz", () => {
    existsSyncMock.mockImplementation((p) => {
      const s = String(p);
      return s === META_PATH || s === FILES_DIR;
    });
    readFileSyncMock.mockReturnValue(
      JSON.stringify({ not: "array" }) as unknown as Buffer
    );
    readdirSyncMock.mockReturnValue(["Y.pdf"] as unknown as string[]);

    const items = getMaterijali();
    expect(items).toEqual([{ file: "Y.pdf", archived: false }]);
  });

  it("filtruje nevalidne stavke iz parsiranog JSON-a (loš shape)", () => {
    existsSyncMock.mockImplementation((p) => String(p) === META_PATH);
    readFileSyncMock.mockReturnValue(
      JSON.stringify([
        { file: "Valid.pdf", archived: false },
        { file: "BezArchived.pdf" },
        { archived: false },
        "string-stavka",
        null,
        { file: 123, archived: true },
      ]) as unknown as Buffer
    );

    const items = getMaterijali();
    expect(items).toEqual([{ file: "Valid.pdf", archived: false }]);
  });
});

describe("getActiveMaterijali", () => {
  it("vraća samo ne-arhivirane", () => {
    existsSyncMock.mockImplementation((p) => String(p) === META_PATH);
    readFileSyncMock.mockReturnValue(
      JSON.stringify([
        { file: "A.pdf", archived: false },
        { file: "B.pdf", archived: true },
        { file: "C.pdf", archived: false },
      ]) as unknown as Buffer
    );

    const active = getActiveMaterijali();
    expect(active.map((m) => m.file)).toEqual(["A.pdf", "C.pdf"]);
  });

  it("vraća prazan niz kada su svi arhivirani", () => {
    existsSyncMock.mockImplementation((p) => String(p) === META_PATH);
    readFileSyncMock.mockReturnValue(
      JSON.stringify([{ file: "X.pdf", archived: true }]) as unknown as Buffer
    );

    expect(getActiveMaterijali()).toEqual([]);
  });
});
