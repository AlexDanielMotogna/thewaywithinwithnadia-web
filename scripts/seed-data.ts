// Content sourced from The_Way_Within_Master_Doc_for_Claude.md §6 (Home),
// §7 (Journey to Self) and §10 (Hotels & Spas) — restructured into an
// elegant web narrative per that doc's own instruction for §7, not invented.
// Pricing/duration are intentionally left unset (PENDING.md): not yet confirmed.
import type { Payload } from "payload";
import type { Page, Service } from "@/payload-types";
import { richText } from "./lexical";

type PageInput = Omit<Page, "id" | "createdAt" | "updatedAt" | "_status">;
type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt">;

async function upsertPage(payload: Payload, data: PageInput) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: data.slug } },
    limit: 1,
  });
  const found = existing.docs[0];

  if (found) {
    await payload.update({ collection: "pages", id: found.id, data });
  } else {
    await payload.create({ collection: "pages", data });
  }
}

async function upsertService(payload: Payload, data: ServiceInput) {
  const existing = await payload.find({
    collection: "services",
    where: { slug: { equals: data.slug } },
    limit: 1,
  });
  const found = existing.docs[0];

  if (found) {
    await payload.update({ collection: "services", id: found.id, data });
  } else {
    await payload.create({ collection: "services", data });
  }
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

const homePage: PageInput = {
  title: "Home",
  slug: "home",
  blocks: [
    {
      blockType: "hero",
      heading: "The Way Within",
      script: "with Nadia",
      tagline: "A Sacred Space to Meet Yourself.",
      subheading:
        "An invitation to slow down, reconnect with your inner wisdom and return to what feels true.",
      primaryCtaLabel: "Begin Your Journey",
      primaryCtaHref: "/journey-to-self",
      secondaryCtaLabel: "Book a Session",
      secondaryCtaHref: "/book",
    },
    {
      blockType: "textImage",
      heading: "Meet Nadia",
      richText: richText({
        paragraph:
          "Nadia does not present herself as someone who has all the answers. Her role is to create a safe space and walk alongside people as they reconnect with their own wisdom and truth.",
      }),
      imagePosition: "left",
    },
    {
      blockType: "quote",
      text: "The light people seek is often already within them. My purpose is to help them remember it.",
      attribution: "Nadia",
    },
    {
      blockType: "cta",
      heading: "Discover Journey to Self",
      body: "A deeper exploration through guided practices, reflection and support.",
      ctaLabel: "Discover Journey to Self",
      ctaHref: "/journey-to-self",
      imagePosition: "right",
    },
    {
      blockType: "servicesPreview",
      heading: "The Offerings",
    },
    {
      blockType: "textImage",
      heading: "A Space for Hotels, Spas & Retreats",
      richText: richText({
        paragraph:
          "Bringing meditation, breathwork and guided wellbeing experiences to hotels, spas, thermal resorts and retreat venues.",
      }),
      imagePosition: "left",
      ctaLabel: "Explore Collaborations",
      ctaHref: "/hotels-spas",
    },
    {
      blockType: "cta",
      heading: "Book Your Session",
      body: "Take the next step on your journey. I look forward to holding space for you.",
      ctaLabel: "Book Your Session",
      ctaHref: "/book",
      imagePosition: "left",
    },
  ],
};

const journeyToSelfPage: PageInput = {
  title: "Journey to Self",
  slug: "journey-to-self",
  blocks: [
    {
      blockType: "hero",
      heading: "Journey to Self",
    },
    {
      blockType: "quote",
      text: "The journey is not about becoming someone new. It is about remembering who you have always been beneath conditioning, expectations and false identities.",
      attribution: "Nadia",
    },
    {
      blockType: "textImage",
      heading: "Vision",
      richText: richText(
        {
          paragraph:
            "Create a safe and supportive space where individuals can reconnect with themselves, discover their authentic truth and learn to embody that truth in everyday life.",
        },
        {
          paragraph:
            "Life experiences, conditioning, expectations, emotional wounds and fear can disconnect people from their true selves. The goal is not to give answers, but to guide each person toward their own inner wisdom, truth and purpose.",
        },
      ),
      imagePosition: "left",
    },
    {
      blockType: "textImage",
      heading: "Mission",
      richText: richText({
        paragraph:
          "Nadia walks alongside people who feel lost, disconnected or called to deeper self-understanding — supporting them through prayer, breathwork, self-awareness, reflection and conscious personal growth.",
      }),
      imagePosition: "right",
    },
    {
      blockType: "principles",
      heading: "Core Principles",
      items: [
        {
          title: "Authenticity",
          description: "Living in alignment with who you truly are.",
        },
        {
          title: "Self-Awareness",
          description:
            "Developing a deeper understanding of thoughts, emotions, patterns and beliefs.",
        },
        {
          title: "Presence",
          description:
            "Learning to become fully present with yourself and your life.",
        },
        {
          title: "Compassion",
          description:
            "Meeting yourself and others with kindness and understanding.",
        },
        {
          title: "Personal Responsibility",
          description:
            "Recognising your power to create change within your own life.",
        },
        {
          title: "Integration",
          description:
            "Transforming insights into practical changes in everyday life.",
        },
      ],
    },
    {
      blockType: "textImage",
      heading: "The Journey",
      richText: richText(
        {
          paragraph:
            "The journey of self-discovery may include questioning old beliefs, releasing limiting patterns, healing emotional wounds, learning self-acceptance, reconnecting with intuition, and discovering purpose and meaning.",
        },
        {
          paragraph:
            "It can also mean developing a deeper relationship with God, and learning to live from truth rather than fear.",
        },
      ),
      imagePosition: "left",
    },
    {
      blockType: "cta",
      heading: "Begin Your Journey",
      ctaLabel: "Book a Session",
      ctaHref: "/book",
    },
  ],
};

const hotelsAndSpasPage: PageInput = {
  title: "Hotels & Spas",
  slug: "hotels-spas",
  blocks: [
    {
      blockType: "hero",
      heading: "Hotels & Spas",
      subheading:
        "Bespoke wellbeing experiences for hotels, boutique hotels, luxury resorts, spas, thermal resorts, retreat venues and wellness destinations.",
      primaryCtaLabel: "Discuss a Collaboration",
      primaryCtaHref: "/contact",
    },
    {
      blockType: "textImage",
      heading: "What We Offer",
      richText: richText({
        bulletList: [
          "Morning meditation",
          "Conscious breathwork",
          "Guest wellbeing experiences",
          "Private sessions",
          "Retreat programmes",
          "Wellbeing days",
          "Wellness packages",
          "Bespoke experiences for the property",
        ],
      }),
    },
    {
      blockType: "cta",
      heading: "Discuss a Collaboration",
      body: "Share your property's details and preferred dates — Nadia will follow up personally.",
      ctaLabel: "Discuss a Collaboration",
      ctaHref: "/contact",
    },
  ],
};

export async function runSeed(payload: Payload): Promise<string[]> {
  const log: string[] = [];

  for (const service of services) {
    await upsertService(payload, service);
    log.push(`service: ${service.slug}`);
  }

  await upsertPage(payload, homePage);
  log.push("page: home");
  await upsertPage(payload, journeyToSelfPage);
  log.push("page: journey-to-self");
  await upsertPage(payload, hotelsAndSpasPage);
  log.push("page: hotels-spas");

  return log;
}
