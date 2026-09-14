import { describe, expect, it } from "vitest";
import { resolveGithubBranch } from "./githubBranch";

describe("resolveGithubBranch", () => {
  describe("na Vercel produkciji", () => {
    it("koristi granu iz koje je deployment nastao", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "production",
          VERCEL_GIT_COMMIT_REF: "main",
        })
      ).toBe("main");
    });

    it("ignoriše GITHUB_BRANCH koji pokazuje na drugu granu", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "production",
          VERCEL_GIT_COMMIT_REF: "main",
          GITHUB_BRANCH: "develop",
        })
      ).toBe("main");
    });

    it("pada na 'main' kad VERCEL_GIT_COMMIT_REF nije izložen", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "production",
          GITHUB_BRANCH: "develop",
        })
      ).toBe("main");
    });

    it("pada na 'main' kad je VERCEL_GIT_COMMIT_REF prazan string", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "production",
          VERCEL_GIT_COMMIT_REF: "   ",
        })
      ).toBe("main");
    });

    it("prati preimenovanu produkcionu granu", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "production",
          VERCEL_GIT_COMMIT_REF: "production",
        })
      ).toBe("production");
    });
  });

  describe("van produkcije", () => {
    it("poštuje GITHUB_BRANCH na preview-u", () => {
      expect(
        resolveGithubBranch({
          VERCEL_ENV: "preview",
          VERCEL_GIT_COMMIT_REF: "feature",
          GITHUB_BRANCH: "develop",
        })
      ).toBe("develop");
    });

    it("default je 'develop' kad GITHUB_BRANCH nije postavljen", () => {
      expect(resolveGithubBranch({ VERCEL_ENV: "preview" })).toBe("develop");
    });

    it("default je 'develop' lokalno, bez Vercel env varijabli", () => {
      expect(resolveGithubBranch({})).toBe("develop");
    });

    it("trimuje GITHUB_BRANCH", () => {
      expect(resolveGithubBranch({ GITHUB_BRANCH: "  feature  " })).toBe(
        "feature"
      );
    });
  });
});
