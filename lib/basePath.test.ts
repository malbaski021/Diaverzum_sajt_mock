import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadBasePath(): Promise<string> {
  vi.resetModules();
  const mod = await import("./basePath");
  return mod.default;
}

describe("basePath", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("vraća prazan string u development okruženju", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(await loadBasePath()).toBe("");
  });

  it("vraća /Diaverzum_sajt_mock kad je production i nije Vercel (GitHub Pages slučaj)", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(await loadBasePath()).toBe("/Diaverzum_sajt_mock");
  });

  it("vraća prazan string u test okruženju", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NODE_ENV", "test");
    expect(await loadBasePath()).toBe("");
  });

  it("vraća prazan string kad je Vercel build (čak i ako je production)", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    expect(await loadBasePath()).toBe("");
  });

  it("Vercel detect ima prednost nad NODE_ENV i u development-u", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "development");
    expect(await loadBasePath()).toBe("");
  });
});
