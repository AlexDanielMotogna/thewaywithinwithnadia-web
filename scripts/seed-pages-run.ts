// Invoked by seed-pages.ts (CLI) and seed.ts. Upserts the site's CMS pages by slug
// (overwriting their blocks) and uploads any page photos not yet in Media.
// Touches ONLY the Pages and Media collections — never Services or any
// booking data. Content lives in seed-pages-data.ts.
import type { Payload } from "payload";
import { uploadOrFind } from "./attach-media-run";
import { buildPages, type MediaKey, type PageInput } from "./seed-pages-data";

const mediaFiles: Record<MediaKey, { file: string; alt: string }> = {
  heroHome: {
    file: "hero-home.png",
    alt: "Mediterranean stone terrace at sunset with olive trees and mountain views",
  },
  nadiaPortrait: {
    file: "nadia-portrait.png",
    alt: "Nadia sitting relaxed on a sunlit terrace",
  },
  candlesBowl: {
    file: "cta-journey-candles.png",
    alt: "Floating candles in a stone bowl among olive branches",
  },
  closingCandle: {
    file: "cta-closing-candle.png",
    alt: "A single lit candle in a stone bowl draped with linen",
  },
  hotelsPool: {
    file: "hotels-spas-pool.png",
    alt: "Infinity pool terrace at golden hour overlooking hills and the sea",
  },
  serviceOneToOne: {
    file: "service-1-1-personal-guidance.png",
    alt: "Cosy lounge seating around a stone coffee table",
  },
  serviceBreathwork: {
    file: "service-conscious-breathwork.png",
    alt: "Rolled linen cushions on a woven mat with candles",
  },
  serviceOnline: {
    file: "service-online-guidance.png",
    alt: "Laptop and notebook on a sunlit terrace table",
  },
  meditation: {
    file: "meditation.jpg",
    alt: "Round meditation cushion beside a stone column at sunset",
  },
  breathwork: {
    file: "breathwork.jpg",
    alt: "Rolled linen cushions on a mat on a sunlit stone terrace",
  },
  lounge: {
    file: "personal-guidance.jpg",
    alt: "Cushions and low seating in a sunlit stone room with mountain views",
  },
  sunsetPanorama: {
    file: "journey-banner.jpg",
    alt: "Sunset over hills and a lake, seen from a terrace with olive branches",
  },
  terraceGreen: {
    file: "booking-banner.jpg",
    alt: "Candles and olive branches on a stone ledge in warm evening light",
  },
  retreats: {
    file: "retreats.jpg",
    alt: "Poolside loungers under umbrellas overlooking the hills",
  },
};

async function uploadMedia(
  payload: Payload,
): Promise<(key: MediaKey) => number> {
  const ids = new Map<string, number>();
  for (const [key, { file, alt }] of Object.entries(mediaFiles)) {
    ids.set(key, await uploadOrFind(payload, file, alt));
  }
  return (key) => {
    const id = ids.get(key);
    if (id === undefined) throw new Error(`Missing media for ${key}`);
    return id;
  };
}

async function findIdBySlug(payload: Payload, slug: string) {
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  return result.docs[0]?.id;
}

async function upsertPage(payload: Payload, data: PageInput): Promise<string> {
  let id = await findIdBySlug(payload, data.slug);
  // "Journey to Self" became "Philosophy": reuse that document.
  if (id === undefined && data.slug === "philosophy") {
    id = await findIdBySlug(payload, "journey-to-self");
  }
  if (id === undefined) {
    await payload.create({ collection: "pages", data });
    return `page created: ${data.slug}`;
  }
  await payload.update({ collection: "pages", id, data });
  return `page updated: ${data.slug}`;
}

export async function runSeedPages(payload: Payload): Promise<string[]> {
  const media = await uploadMedia(payload);
  const log: string[] = [];
  for (const page of buildPages(media)) {
    log.push(await upsertPage(payload, page));
  }
  return log;
}
