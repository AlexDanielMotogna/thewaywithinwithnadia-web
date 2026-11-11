// Page content for the 2026-11 restructure. Structure and copy follow the
// client's "Website Structure.docx" mockups, deliberately CONDENSED (the
// mockups are text-heavy): short excerpts of Nadia's own wording, not new
// claims. Sentences containing words LEGAL.md §8 flags ("healing",
// "nervous system") were left out of the excerpts; the safety texts are
// Nadia's and are listed in PENDING.md for her/lawyer review.
//
// English only — German falls back to English until real DE copy arrives
// (PENDING.md #7). Media are referenced by key; see seed-pages.ts.
import type { Page } from "@/payload-types";
import { richText } from "./lexical";

export type PageInput = Omit<Page, "id" | "createdAt" | "updatedAt">;

export type MediaKey =
  | "heroHome"
  | "nadiaPortrait"
  | "candlesBowl"
  | "closingCandle"
  | "hotelsPool"
  | "serviceOneToOne"
  | "serviceBreathwork"
  | "serviceOnline"
  | "meditation"
  | "breathwork"
  | "lounge"
  | "sunsetPanorama"
  | "terraceGreen"
  | "retreats";

/** Resolves a media key to its uploaded Media id (throws if missing). */
type Media = (key: MediaKey) => number;

const BOOK = { primaryCtaLabel: "Book a Session", primaryCtaHref: "/book" };

const FOUR_PILLARS = [
  {
    icon: "compass",
    title: "Alignment",
    description: "Living in harmony with your true self.",
  },
  {
    icon: "heart",
    title: "Gratitude",
    description: "Recognising the beauty in every moment.",
  },
  {
    icon: "waves",
    title: "Surrender",
    description: "Releasing what no longer serves you.",
  },
  {
    icon: "sun",
    title: "Faith",
    description: "The quiet knowing that you are always supported.",
  },
] as const;

function home(m: Media): PageInput {
  return {
    title: "Home",
    slug: "home",
    _status: "published",
    seo: {
      title: "The Way Within with Nadia",
      description:
        "A sacred space to meet yourself — meditation, conscious breathwork and 1:1 guidance with Nadia.",
    },
    blocks: [
      {
        blockType: "hero",
        layout: "overlay",
        eyebrow: "Welcome to",
        heading: "The Way Within",
        script: "A sacred space to meet yourself.",
        tagline: "Meditation · Breathwork · 1:1 Guidance · Retreats",
        image: m("heroHome"),
        primaryCtaLabel: "Begin Your Journey",
        primaryCtaHref: "/philosophy",
        secondaryCtaLabel: "Book a Session",
        secondaryCtaHref: "/book",
      },
      {
        blockType: "textImage",
        eyebrow: "A gentle welcome",
        heading: "I'm Nadia",
        richText: richText({
          paragraph:
            "The Way Within was born from my own journey of self-discovery, and from a deep wish to help others reconnect with who they truly are. I don't have all the answers — I create a safe space and walk beside you.",
        }),
        asideNote: "You are already enough, just as you are.",
        image: m("nadiaPortrait"),
        imagePosition: "left",
        ctaLabel: "Get to Know Me",
        ctaHref: "/about",
      },
      {
        blockType: "servicesPreview",
        heading: "Ways to Support Your Journey",
      },
      {
        blockType: "principles",
        heading: "The Heart of The Way Within",
        script: "Four guiding principles to bring you back to yourself.",
        variant: "columns",
        tone: "soft",
        items: [...FOUR_PILLARS],
        closing:
          "It is not about becoming someone else. It is about remembering who you have always been.",
      },
      {
        blockType: "textImage",
        eyebrow: "The Way Within",
        heading: "More Than a Destination",
        script: "A way of living, a return to yourself.",
        richText: richText({
          paragraph:
            "Through meditation, conscious breathwork, compassion, gratitude and faith, I guide you back to your inner wisdom — and to a life lived with more presence and purpose.",
        }),
        image: m("meditation"),
        imagePosition: "right",
        ctaLabel: "What I Offer",
        ctaHref: "/services",
      },
      {
        blockType: "textImage",
        eyebrow: "Hotels, spas & retreats",
        heading: "Wellbeing Experiences for Your Guests",
        richText: richText({
          paragraph:
            "Morning meditation, conscious breathwork and bespoke wellbeing days for hotels, spas, thermal resorts and retreat venues.",
        }),
        image: m("hotelsPool"),
        imagePosition: "left",
        imageShape: "framed",
        tone: "soft",
        ctaLabel: "Explore Collaborations",
        ctaHref: "/hotels-spas",
      },
      {
        blockType: "cta",
        variant: "light",
        heading: "Begin Your Journey",
        body: "The journey is inward. The transformation is lived outward.",
        ctaLabel: "Book Your Session",
        ctaHref: "/book",
        backgroundImage: m("closingCandle"),
        imagePosition: "right",
      },
    ],
  };
}

function about(m: Media): PageInput {
  return {
    title: "About Me",
    slug: "about",
    _status: "published",
    seo: {
      title: "About Me — The Way Within with Nadia",
      description:
        "Nadia's journey of love, awareness and returning to herself — the inspiration behind The Way Within.",
    },
    blocks: [
      {
        blockType: "hero",
        layout: "split",
        eyebrow: "About me",
        heading: "My Journey",
        script: "The inspiration behind The Way Within.",
        subheading: "A journey of love, awareness and returning to myself.",
        image: m("nadiaPortrait"),
      },
      {
        blockType: "textImage",
        heading: "A Little About Me",
        headingStyle: "script",
        richText: richText({
          paragraph:
            "For much of my life I searched outside myself for love, acceptance and the feeling of being seen. What I didn't yet recognise was how deeply my own fears and patterns shaped the way I experienced life.",
        }),
        image: m("lounge"),
        imagePosition: "left",
        imageShape: "framed",
      },
      {
        blockType: "textImage",
        heading: "The Experience That Changed My Life",
        headingStyle: "script",
        richText: richText({
          paragraph:
            "A profound and beautiful love showed me something I had always longed for — and invited me to see the fears and beliefs standing between me and the life I truly wanted.",
        }),
        highlight:
          "That love inspired the journey. But the journey itself was mine to walk.",
        image: m("candlesBowl"),
        imagePosition: "right",
        imageShape: "framed",
        tone: "soft",
      },
      {
        blockType: "textImage",
        heading: "The Peace That Was Always Within",
        headingStyle: "script",
        richText: richText({
          paragraph:
            "Through meditation, prayer, breathwork and honest reflection, I learned to pause instead of react. I discovered that no one else could give me the inner peace I had not yet learned to cultivate within myself.",
        }),
        highlight:
          "Self-love is not something to think about. It is something to practise and live.",
        image: m("breathwork"),
        imagePosition: "left",
        imageShape: "framed",
      },
      {
        blockType: "textImage",
        heading: "Why I Created The Way Within",
        headingStyle: "script",
        richText: richText({
          paragraph:
            "A space where you can slow down, reconnect with yourself and gently explore whatever is arising. I am not here to tell you who you should become. It is your journey — I am simply here to guide you.",
        }),
        image: m("serviceOneToOne"),
        imagePosition: "right",
        imageShape: "framed",
        tone: "soft",
      },
      {
        blockType: "quote",
        style: "script",
        text: "What if the love you've been searching for begins with the way you love yourself?",
        attribution: "A reflection from Nadia",
      },
      {
        blockType: "cta",
        variant: "light",
        heading: "Happiness Is Not Found. It Is Uncovered.",
        body: "The journey is inward. The transformation is lived outward.",
        ctaLabel: BOOK.primaryCtaLabel,
        ctaHref: BOOK.primaryCtaHref,
        secondaryCtaLabel: "Contact Me",
        secondaryCtaHref: "/contact",
        backgroundImage: m("closingCandle"),
        imagePosition: "right",
      },
    ],
  };
}

function philosophy(m: Media): PageInput {
  return {
    title: "Philosophy",
    slug: "philosophy",
    _status: "published",
    seo: {
      title: "The Philosophy — The Way Within with Nadia",
      description:
        "Journey to Self: not becoming someone else, but remembering who you truly are.",
    },
    blocks: [
      {
        blockType: "hero",
        layout: "split",
        heading: "The Philosophy",
        script: "A journey of courage, self-discovery and love.",
        subheading:
          "The way within is not about becoming someone else. It is about remembering who you truly are.",
        image: m("candlesBowl"),
      },
      {
        blockType: "textImage",
        eyebrow: "The journey to yourself",
        heading: "Returning to What Is True",
        richText: richText(
          {
            paragraph:
              "The journey to yourself begins with courage — the courage to look within, question old beliefs and reconnect with who you truly are.",
          },
          {
            paragraph:
              "My role is to listen, connect and guide you with compassion, while respecting your own journey and pace.",
          },
        ),
        image: m("meditation"),
        imagePosition: "left",
        imageShape: "arch",
      },
      {
        blockType: "principles",
        heading: "The Guiding Principles",
        script: "Four pillars to support your journey back to yourself.",
        variant: "columns",
        tone: "soft",
        items: [
          {
            icon: "sun",
            title: "Alignment",
            description:
              "Living in harmony with your true self, making choices that feel honest and authentic.",
          },
          {
            icon: "lotus",
            title: "Gratitude",
            description:
              "Recognising the beauty in every moment. Gratitude opens the heart.",
          },
          {
            icon: "waves",
            title: "Surrender",
            description:
              "Releasing what no longer serves you, and trusting the flow of life.",
          },
          {
            icon: "infinity",
            title: "Faith",
            description:
              "Trusting yourself, the journey and what is yet to come.",
          },
        ],
      },
      {
        blockType: "textImage",
        eyebrow: "A deeper understanding",
        heading: "When You Feel the Call to Look Within",
        richText: richText({
          paragraph:
            "Sometimes the familiar no longer feels right, and something within us calls for change. There is no need for perfection or rushing — only the willingness to begin.",
        }),
        highlight:
          "This is where the journey begins — choosing the unknown path of love over the familiar path of fear.",
        image: m("sunsetPanorama"),
        imagePosition: "right",
      },
      {
        blockType: "cta",
        variant: "light",
        eyebrow: "The essence of The Way Within",
        heading: "A Sacred Space to Meet Yourself",
        body: "The journey is inward. The transformation is lived outward.",
        ctaLabel: BOOK.primaryCtaLabel,
        ctaHref: BOOK.primaryCtaHref,
        backgroundImage: m("closingCandle"),
        imagePosition: "left",
      },
    ],
  };
}

function services(m: Media): PageInput {
  return {
    title: "What I Offer",
    slug: "services",
    _status: "published",
    seo: {
      title: "What I Offer — The Way Within with Nadia",
      description:
        "Meditation, conscious breathwork, 1:1 guidance online and in person, retreats and wellbeing days.",
    },
    blocks: [
      {
        blockType: "hero",
        layout: "centered",
        eyebrow: "A sacred space to meet yourself",
        heading: "What I Offer",
        subheading:
          "A personal journey of self-awareness and inner connection — through prayer, breathwork, meditation, reflection and compassionate guidance.",
      },
      {
        blockType: "servicesPreview",
        heading: "Choose Your Path",
      },
      {
        blockType: "textImage",
        eyebrow: "The journey within",
        heading: "1:1 Online Sessions",
        richText: richText({
          paragraph:
            "A personal session through Google Meet, adapted to your needs, comfort and intentions — from the privacy of your own space.",
        }),
        image: m("serviceOnline"),
        imagePosition: "right",
        tone: "soft",
      },
      {
        blockType: "principles",
        heading: "What Your Session Includes",
        variant: "cards",
        numbered: true,
        items: [
          {
            icon: "prayer",
            title: "Opening Prayer",
            description:
              "A gentle moment of gratitude and intention. Participation is always optional.",
          },
          {
            icon: "lotus",
            title: "Breathwork",
            description:
              "Guided breathing to ground you in the present moment.",
          },
          {
            icon: "heart",
            title: "Heart-Centred Meditation",
            description:
              "Turning your attention inward, with curiosity rather than judgment.",
          },
          {
            icon: "book",
            title: "Reflection & Integration",
            description:
              "Exploring what you noticed, and how to bring it into everyday life.",
          },
          {
            icon: "chat",
            title: "Personal Sharing",
            description:
              "A welcoming space to speak openly. I listen without judgment.",
          },
          {
            icon: "sun",
            title: "Closing Intention",
            description: "A small, conscious practice to carry into your day.",
          },
        ],
      },
      {
        blockType: "principles",
        heading: "Where We Connect",
        script: "A peaceful space to pause and look within.",
        variant: "columns",
        tone: "soft",
        items: [
          {
            icon: "laptop",
            title: "Online — Wherever You Are",
            description:
              "A personal 1:1 session through Google Meet, from the comfort of your own space.",
          },
          {
            icon: "home",
            title: "In Person — Selected Places",
            description:
              "Private sessions, group experiences and retreats in carefully chosen wellness spaces.",
          },
        ],
      },
      {
        blockType: "notice",
        icon: "lotus",
        heading: "A Gentle Reminder",
        body: "The Way Within offers spiritual and wellbeing guidance and reflective practices. It is not a substitute for medical care or psychotherapy.",
        linkLabel: "Read Safety & Wellbeing",
        linkHref: "/safety-wellbeing",
      },
      {
        blockType: "cta",
        variant: "light",
        heading: "Begin Your Journey",
        body: "You do not need to have all the answers. You only need a willingness to be present.",
        ctaLabel: BOOK.primaryCtaLabel,
        ctaHref: BOOK.primaryCtaHref,
        secondaryCtaLabel: "In-Person Experiences",
        secondaryCtaHref: "/hotels-spas",
        backgroundImage: m("terraceGreen"),
        imagePosition: "right",
      },
    ],
  };
}

function safety(m: Media): PageInput {
  return {
    title: "Safety & Wellbeing",
    slug: "safety-wellbeing",
    _status: "published",
    seo: {
      title: "Safety & Wellbeing — The Way Within with Nadia",
      description:
        "Important safety guidelines for breathwork and meditation, and how each session is held with care.",
    },
    blocks: [
      {
        blockType: "hero",
        layout: "split",
        heading: "Safety & Wellbeing",
        tagline: "A mindful and caring approach",
        subheading:
          "Your wellbeing always comes first. Every experience is created with care, respect and compassion for your own journey.",
        image: m("closingCandle"),
      },
      {
        blockType: "textImage",
        heading: "A Safe and Supportive Space",
        richText: richText({
          paragraph:
            "Meditation, breathwork and inner exploration can bring awareness to physical sensations, emotions and personal experiences. My intention is that you feel supported, informed and respected, so you can make the best decisions for your wellbeing.",
        }),
      },
      {
        blockType: "principles",
        heading: "Important Safety Guidelines",
        variant: "columns",
        tone: "soft",
        items: [
          {
            icon: "heart",
            title: "Pregnancy",
            description:
              "Breathwork practices are not suitable during pregnancy.",
          },
          {
            icon: "alert",
            title: "Epilepsy",
            description:
              "Do not practise breathwork if you have epilepsy or a history of seizures.",
          },
          {
            icon: "pulse",
            title: "Medical Conditions",
            description:
              "With cardiovascular issues, high or low blood pressure or another serious condition, consult a healthcare professional first.",
          },
          {
            icon: "waves",
            title: "Use Caution",
            description:
              "Never practise while driving, swimming, bathing, or anywhere losing consciousness could lead to injury.",
          },
        ],
      },
      {
        blockType: "textImage",
        heading: "Practice With Awareness",
        richText: richText({
          paragraph:
            "These practices are for guidance only. Always listen to your body and never push beyond your comfort level. If you feel unwell, stop immediately — you may slow down, return to natural breathing or pause at any time.",
        }),
        highlight:
          "There is no expectation to push through discomfort or to reach a particular emotional experience.",
        image: m("serviceBreathwork"),
        imagePosition: "left",
      },
      {
        blockType: "textImage",
        heading: "Sensations You May Notice",
        tone: "soft",
        richText: richText(
          {
            paragraph:
              "Breathing techniques may cause temporary sensations, such as:",
          },
          {
            bulletList: [
              "Tingling",
              "Light-headedness",
              "A ringing in the ears",
              "Dizziness",
            ],
          },
          {
            paragraph:
              "If you feel uncomfortable or the sensations continue, stop and return to natural breathing. If you are unsure whether a practice is suitable for you, please consult a qualified healthcare professional first.",
          },
        ),
      },
      {
        blockType: "notice",
        icon: "sun",
        heading: "A Gentle Reminder",
        body: "The Way Within offers spiritual and wellbeing guidance. It is not a substitute for medical care, psychotherapy or other professional mental health treatment. If you are unsure whether a session is right for you, I am happy to talk it through.",
        linkLabel: "Contact me",
        linkHref: "/contact",
      },
      {
        blockType: "cta",
        variant: "light",
        eyebrow: "When you feel ready",
        heading: "Begin Your Journey",
        body: "If you have any questions, I am here to support you.",
        ctaLabel: BOOK.primaryCtaLabel,
        ctaHref: BOOK.primaryCtaHref,
        backgroundImage: m("terraceGreen"),
        imagePosition: "right",
      },
    ],
  };
}

function contact(m: Media): PageInput {
  return {
    title: "Contact",
    slug: "contact",
    _status: "published",
    seo: {
      title: "Contact — The Way Within with Nadia",
      description:
        "Questions, bookings or in-person experiences — I would love to hear from you.",
    },
    // The form is code-owned and renders after the first block (the hero).
    blocks: [
      {
        blockType: "hero",
        layout: "split",
        eyebrow: "Let's connect",
        heading: "Contact Me",
        script: "I would love to hear from you.",
        subheading:
          "Whether you have a question, would like to book a session or explore an in-person experience — feel free to reach out.",
        image: m("lounge"),
      },
      {
        blockType: "cta",
        variant: "light",
        heading: "Begin Your Journey",
        body: "You do not need to have all the answers. You only need a willingness to be present.",
        ctaLabel: BOOK.primaryCtaLabel,
        ctaHref: BOOK.primaryCtaHref,
        backgroundImage: m("closingCandle"),
        imagePosition: "right",
      },
    ],
  };
}

function hotelsSpas(m: Media): PageInput {
  return {
    title: "Hotels & Spas",
    slug: "hotels-spas",
    _status: "published",
    seo: {
      title: "Hotels & Spas — The Way Within with Nadia",
      description:
        "Meditation, breathwork and bespoke wellbeing experiences for hotels, spas, thermal resorts and retreat venues.",
    },
    // The enquiry form is code-owned and renders after these blocks.
    blocks: [
      {
        blockType: "hero",
        layout: "split",
        eyebrow: "Collaborations",
        heading: "Hotels & Spas",
        script: "Wellbeing experiences for your guests.",
        subheading:
          "Bespoke meditation and breathwork experiences for hotels, spas, thermal resorts and retreat venues.",
        image: m("hotelsPool"),
        primaryCtaLabel: "Discuss a Collaboration",
        primaryCtaHref: "#enquiry",
      },
      {
        blockType: "textImage",
        eyebrow: "For your property",
        heading: "What I Can Offer",
        richText: richText({
          bulletList: [
            "Morning meditation",
            "Conscious breathwork",
            "Guest wellbeing experiences",
            "Private sessions",
            "Retreat programmes and wellbeing days",
            "Bespoke experiences for your property",
          ],
        }),
        image: m("retreats"),
        imagePosition: "left",
        imageShape: "arch",
      },
    ],
  };
}

export function buildPages(media: Media): PageInput[] {
  return [
    home(media),
    about(media),
    philosophy(media),
    services(media),
    safety(media),
    contact(media),
    hotelsSpas(media),
  ];
}
