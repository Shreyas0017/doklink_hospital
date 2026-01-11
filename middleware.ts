import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");
  const isPublicApi = request.nextUrl.pathname === "/api/hospitals/register";

  // Allow auth pages and auth API routes
  if (isAuthPage || isApiAuth || isPublicApi) {
    if (token && isAuthPage) {
      // Redirect to home if already logged in
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add hospital context to headers for API routes
  const response = NextResponse.next();
  response.headers.set("x-hospital-id", token.hospitalId as string);
  response.headers.set("x-user-id", token.id as string);
  response.headers.set("x-user-role", token.role as string);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
