import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Nadia's address from SiteSettings, read directly (not through the cached
 * `getSiteSettings` of modules/content): this runs inside background jobs,
 * outside any request, where Next's `"use cache"` has no request scope.
 */
export async function getOwnerEmail(): Promise<string | null> {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({ slug: "site-settings" });
  return settings.email ?? null;
}
