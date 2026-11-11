// Services from The_Way_Within_Master_Doc_for_Claude.md §8 (created once,
// never overwritten). Page content lives in seed-pages-data.ts.
// Pricing/duration are intentionally left unset (PENDING.md): not yet confirmed.
import type { Payload } from "payload";
import type { Service } from "@/payload-types";
import { richText } from "./lexical";
import { runSeedPages } from "./seed-pages-run";

type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt">;

async function createServiceIfMissing(payload: Payload, data: ServiceInput) {
  const existing = await payload.find({
    collection: "services",
    where: { slug: { equals: data.slug } },
    limit: 1,
  });
  const found = existing.docs[0];

  // Create-only: never overwrite a service that already exists — its
  // price/duration/booking flags are edited in the admin (PENDING.md #18).
  if (found) return false;
  await payload.create({ collection: "services", data });
  return true;
}

const services: ServiceInput[] = [
  {
    name: "Meditation",
    slug: "meditation",
    shortDescription:
      "Guided practices centred on presence, stillness and reconnection.",
    description: richText({
      paragraph:
        "Guided practices centred on presence, stillness, self-awareness and reconnection.",
    }),
    mode: "both",
    currency: "EUR",
    active: true,
    featured: true,
    bookingEnabled: false,
  },
  {
    name: "Conscious Breathwork",
    slug: "conscious-breathwork",
    shortDescription:
      "Breath-led practices supporting grounding and nervous-system regulation.",
    description: richText({
      paragraph:
        "Breath-led practices supporting grounding, nervous-system regulation, awareness and presence.",
    }),
    mode: "both",
    currency: "EUR",
    active: true,
    featured: true,
    bookingEnabled: false,
  },
  {
    name: "1:1 Personal Guidance",
    slug: "1-1-personal-guidance",
    shortDescription:
      "Private sessions offering a safe space for reflection and growth.",
    description: richText({
      paragraph:
        "Private sessions offering a safe space for reflection, self-awareness, integration and personal growth.",
    }),
    mode: "in_person",
    currency: "EUR",
    active: true,
    featured: true,
    bookingEnabled: false,
  },
  {
    name: "Online Guidance",
    slug: "online-guidance",
    shortDescription: "Remote sessions for those who cannot attend in person.",
    description: richText({
      paragraph: "Remote sessions for clients who cannot attend in person.",
    }),
    mode: "online",
    currency: "EUR",
    active: true,
    featured: true,
    bookingEnabled: false,
  },
  {
    name: "Retreats & Wellbeing Days",
    slug: "retreats-wellbeing-days",
    shortDescription:
      "Longer experiences combining selected practices in a supportive setting.",
    description: richText({
      paragraph:
        "Longer experiences combining selected practices in a supportive setting.",
    }),
    mode: "both",
    currency: "EUR",
    active: true,
    featured: true,
    bookingEnabled: false,
  },
];

export async function runSeed(payload: Payload): Promise<string[]> {
  const log: string[] = [];

  for (const service of services) {
    const created = await createServiceIfMissing(payload, service);
    log.push(`service ${created ? "created" : "kept"}: ${service.slug}`);
  }

  log.push(...(await runSeedPages(payload)));
  return log;
}
