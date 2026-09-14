/**
 * Grana u koju admin panel piše sadržaj preko GitHub Contents API-ja
 * (i iz koje ga čita).
 *
 * Na Vercel produkciji izvor istine je grana iz koje je taj deployment i
 * nastao — `VERCEL_GIT_COMMIT_REF`. Ako admin na diaverzum.rs piše u bilo
 * koju drugu granu, izmena se "sačuva" ali je produkcija nikad ne prikaže,
 * jer se ta grana ne deploy-uje. Zato na produkciji GITHUB_BRANCH namerno
 * NE može da nadjača deployment granu.
 *
 * Van produkcije (preview, lokalni dev) GITHUB_BRANCH i dalje odlučuje,
 * uz `develop` kao default.
 */
export function resolveGithubBranch(
  env: Record<string, string | undefined> = process.env
): string {
  if (env.VERCEL_ENV === "production") {
    return env.VERCEL_GIT_COMMIT_REF?.trim() || "main";
  }

  return env.GITHUB_BRANCH?.trim() || "develop";
}

const githubBranch = resolveGithubBranch();

export default githubBranch;
