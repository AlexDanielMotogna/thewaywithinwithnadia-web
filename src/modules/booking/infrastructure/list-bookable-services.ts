import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import type { Service } from "@/payload-types";

export type ContentLocale = "en" | "de";

const bookable: Where = {
  and: [
    { active: { equals: true } },
    { bookingEnabled: { equals: true } },
    { durationMin: { greater_than: 0 } },
    // FAGG §7.1/§7.2 (LEGAL.md) require the total price to be shown
    // before booking — a service with pricing not yet confirmed
    // (PENDING.md #18) must never appear as bookable, even if someone
    // flips `bookingEnabled` on in the admin before setting a price.
    { price: { greater_than_equal: 0 } },
  ],
};

export async function listBookableServices(
  locale: ContentLocale,
): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: bookable,
    locale,
    depth: 1,
    sort: "name",
    limit: 0,
  });
  return result.docs;
}

export async function getBookableServiceBySlug(
  slug: string,
  locale: ContentLocale,
): Promise<Service | null> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: { and: [bookable, { slug: { equals: slug } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  return result.docs[0] ?? null;
}
