import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const protectedRoutes = ["/dashboard", "/product/", "/product"];
export const authRoutes = ["/"]; //login page

export async function middleware(request: NextRequest) {
  const userData = request.cookies.get("userData");

  if (authRoutes.includes(request.nextUrl.pathname) && userData) {
    console.log("Redirecting to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedRoutes.includes(request.nextUrl.pathname) && !userData) {
    console.log("Redirecting to /login");
    request.cookies.delete("userData");
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("userData");

    return response;
  }
}
