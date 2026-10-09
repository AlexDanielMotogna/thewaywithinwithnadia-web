import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload, type TypedLocale } from "payload";
import type { Page } from "@/payload-types";

export async function getPageBySlug(
  slug: string,
  locale: TypedLocale,
): Promise<Page | null> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    locale,
    fallbackLocale: "en",
  });

  return result.docs[0] ?? null;
}
