import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isInvitePage = req.nextUrl.pathname.startsWith("/invite");
  const isPublicPage = req.nextUrl.pathname === "/";
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");

  // Allow API auth routes
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Allow public pages, auth pages, and invite pages
  // Invite pages must be public since invitees aren't logged in yet
  if (isPublicPage || isAuthPage || isInvitePage) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files and api routes (except auth)
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api(?!/auth)).*)",
  ],
};
