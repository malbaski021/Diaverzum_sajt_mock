import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest, user: string, pass: string, realm: string) {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const base64 = authHeader.replace("Basic ", "");
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin UI + admin API rute — obe moraju biti iza basic auth-a.
  // /api/admin/* ima GitHub write token, pa je bez zaštite jednako opasno
  // kao otvoren /admin-diaverzum.
  if (
    pathname.startsWith("/admin-diaverzum") ||
    pathname.startsWith("/api/admin")
  ) {
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASS;
    const unauthorized = new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });

    // Bez konfigurisanih kredencijala: na produkciji fail-closed (radije
    // nedostupan admin nego otvoren), lokalno propušta radi razvoja.
    if (!user || !pass) {
      return process.env.VERCEL_ENV === "production"
        ? unauthorized
        : NextResponse.next();
    }

    if (!checkAuth(req, user, pass, "Admin")) {
      return unauthorized;
    }
    return NextResponse.next();
  }

  // Staging basic auth — nikad na produkciji.
  // VERCEL_ENV Vercel postavlja automatski: "production" | "preview" | "development".
  // Javni sajt na diaverzum.rs mora biti otvoren bez obzira na BASIC_AUTH_ENABLED.
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.BASIC_AUTH_ENABLED !== "true"
  ) {
    return NextResponse.next();
  }

  const stageUser = process.env.STAGE_USER ?? "11111";
  const stagePass = process.env.STAGE_PASS ?? "99999";
  if (!checkAuth(req, stageUser, stagePass, "Diaverzum Stage")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Diaverzum Stage"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
