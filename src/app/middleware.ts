// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./lib/auth";

export function middleware(req: NextRequest) {
  const user = getCurrentUser(req);
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Admin-only routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check admin access
    if (isAdminRoute && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = user.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
