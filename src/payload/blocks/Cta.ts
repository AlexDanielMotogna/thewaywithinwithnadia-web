import type { Block } from "payload";

export const Cta: Block = {
  slug: "cta",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    { name: "heading", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", localized: true },
    { name: "ctaLabel", type: "text", required: true, localized: true },
    { name: "ctaHref", type: "text", required: true },
  ],
};
