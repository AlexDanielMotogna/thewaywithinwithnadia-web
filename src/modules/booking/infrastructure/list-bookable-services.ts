import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload } from "payload";
import type { Service } from "@/payload-types";

export async function listBookableServices(): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: {
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
    },
    sort: "name",
    limit: 0,
  });
  return result.docs;
}
