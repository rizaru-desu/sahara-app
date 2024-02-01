import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const protectedRoutes = ["/page/dashboard", "/page/all-user"];
export const authRoutes = ["/"];

export async function middleware(request: NextRequest) {
  const userData = request.cookies.get("userData");
  if (authRoutes.includes(request.nextUrl.pathname) && userData) {
    return NextResponse.redirect(new URL("/page/dashboard", request.url));
  }

  if (protectedRoutes.includes(request.nextUrl.pathname) && !userData) {
    request.cookies.delete("userData");
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("userData");

    return response;
  }
}
