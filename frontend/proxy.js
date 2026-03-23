import { NextResponse } from "next/server";

export function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isProtected = pathname.startsWith("/dashboard");

  // If not logged in → block dashboard
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If logged in → block auth pages ONLY
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};