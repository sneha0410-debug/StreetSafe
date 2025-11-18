import { clerkMiddleware } from "@clerk/nextjs/server";

export default async function middleware(req, ev) {
  try {
    return await clerkMiddleware()(req, ev);
  } catch (err) {
    console.error("Clerk middleware error:", err);
    throw err;
  }
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
