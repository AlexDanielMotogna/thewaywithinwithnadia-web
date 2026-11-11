// Uploads the photos in media-uploads/ to Payload's Media collection
// (idempotent — skips a file if a Media doc with that filename already
// exists), then attaches them to the 5 Services. Page images are attached
// by seed-pages.ts. See attach-media.ts (CLI) for how this gets invoked.
import path from "node:path";
import { type Payload } from "payload";

type MediaKey =
  | "heroHome"
  | "nadiaPortrait"
  | "ctaJourney"
  | "serviceRetreats"
  | "serviceOnline"
  | "service1on1"
  | "serviceBreathwork"
  | "serviceMeditation"
  | "hotelsSpasPool"
  | "ctaClosing";

const files: { key: MediaKey; file: string; alt: string }[] = [
  {
    key: "heroHome",
    file: "hero-home.png",
    alt: "Mediterranean stone terrace at sunset with olive trees and mountain views",
  },
  {
    key: "nadiaPortrait",
    file: "nadia-portrait.png",
    alt: "Nadia sitting relaxed on a sunlit terrace",
  },
  {
    key: "ctaJourney",
    file: "cta-journey-candles.png",
    alt: "Floating candles in a stone bowl among olive branches",
  },
  {
    key: "serviceRetreats",
    file: "service-retreats-wellbeing-days.png",
    alt: "Poolside loungers under umbrellas overlooking the hills",
  },
  {
    key: "serviceOnline",
    file: "service-online-guidance.png",
    alt: "Laptop and notebook on a sunlit terrace table",
  },
  {
    key: "service1on1",
    file: "service-1-1-personal-guidance.png",
    alt: "Cosy lounge seating around a stone coffee table",
  },
  {
    key: "serviceBreathwork",
    file: "service-conscious-breathwork.png",
    alt: "Rolled linen cushions on a woven mat with candles",
  },
  {
    key: "serviceMeditation",
    file: "service-meditation.png",
    alt: "Round meditation cushion on a terrace with a stone bowl and candle",
  },
  {
    key: "hotelsSpasPool",
    file: "hotels-spas-pool.png",
    alt: "Infinity pool terrace at golden hour overlooking hills and the sea",
  },
  {
    key: "ctaClosing",
    file: "cta-closing-candle.png",
    alt: "A single lit candle in a stone bowl draped with linen",
  },
];

export async function uploadOrFind(
  payload: Payload,
  file: string,
  alt: string,
): Promise<number> {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: file } },
    limit: 1,
  });
  const found = existing.docs[0];
  if (found) return found.id;

  const created = await payload.create({
    collection: "media",
    data: { alt },
    // process.cwd(), not import.meta.dirname: this module is also imported
    // from a bundled Next.js route handler, where import.meta.dirname is
    // undefined (see BUGS.md).
    filePath: path.resolve(process.cwd(), "media-uploads", file),
  });
  return created.id;
}

function required(ids: Map<MediaKey, number>, key: MediaKey): number {
  const id = ids.get(key);
  if (id === undefined) throw new Error(`Missing uploaded media for ${key}`);
  return id;
}

export async function runAttachMedia(payload: Payload): Promise<string[]> {
  const log: string[] = [];

  const ids = new Map<MediaKey, number>();
  for (const { key, file, alt } of files) {
    ids.set(key, await uploadOrFind(payload, file, alt));
    log.push(`media: ${file}`);
  }

  const serviceImages: { slug: string; mediaKey: MediaKey }[] = [
    { slug: "meditation", mediaKey: "serviceMeditation" },
    { slug: "conscious-breathwork", mediaKey: "serviceBreathwork" },
    { slug: "1-1-personal-guidance", mediaKey: "service1on1" },
    { slug: "online-guidance", mediaKey: "serviceOnline" },
    { slug: "retreats-wellbeing-days", mediaKey: "serviceRetreats" },
  ];
  for (const { slug, mediaKey } of serviceImages) {
    const imageId = required(ids, mediaKey);
    await payload.update({
      collection: "services",
      where: { slug: { equals: slug } },
      data: { image: imageId },
    });
    log.push(`service image: ${slug}`);
  }

  return log;
}
