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

  // Admin route — zaštićen samo kad su env varijable postavljene
  if (pathname.startsWith("/admin-diaverzum")) {
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASS;
    if (user && pass && !checkAuth(req, user, pass, "Admin")) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
      });
    }
    return NextResponse.next();
  }

  // Staging basic auth
  if (process.env.BASIC_AUTH_ENABLED !== "true") {
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
