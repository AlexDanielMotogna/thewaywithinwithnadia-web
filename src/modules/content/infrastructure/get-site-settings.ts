import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload } from "payload";
import type { SiteSetting } from "@/payload-types";

export async function getSiteSettings(): Promise<SiteSetting> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "site-settings" });
}
