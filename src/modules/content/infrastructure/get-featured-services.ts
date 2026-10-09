import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload, type TypedLocale } from "payload";
import type { Service } from "@/payload-types";

export async function getFeaturedServices(
  locale: TypedLocale,
): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: { active: { equals: true }, featured: { equals: true } },
    depth: 1,
    limit: 10,
    locale,
    fallbackLocale: "en",
  });

  return result.docs;
}
