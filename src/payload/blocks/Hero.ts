import type { Block } from "payload";

export const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "heading", type: "text", required: true, localized: true },
    { name: "script", type: "text", localized: true },
    {
      name: "tagline",
      type: "text",
      localized: true,
      admin: {
        description:
          "Short emphasized line, e.g. 'A Sacred Space to Meet Yourself.'",
      },
    },
    { name: "subheading", type: "textarea", localized: true },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "primaryCtaLabel", type: "text", localized: true },
    { name: "primaryCtaHref", type: "text" },
    { name: "secondaryCtaLabel", type: "text", localized: true },
    { name: "secondaryCtaHref", type: "text" },
  ],
};
