import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// `middleware.ts` was renamed to `proxy.ts` in Next.js 16 — the exported
// function itself is unchanged, next-intl's createMiddleware() returns a
// standard proxy-compatible handler. See BUGS.md if this surprises you.
export default createMiddleware(routing);

export const config = {
  // Skip Payload's admin/API routes, Next internals and static files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
