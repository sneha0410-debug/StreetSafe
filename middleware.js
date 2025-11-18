import { clerkMiddleware } from "@clerk/nextjs/server";

// Only use Clerk middleware in Edge runtime
export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};
