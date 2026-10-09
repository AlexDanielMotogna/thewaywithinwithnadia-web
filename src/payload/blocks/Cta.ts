import type { Block } from "payload";

export const Cta: Block = {
  slug: "cta",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    { name: "heading", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", localized: true },
    { name: "ctaLabel", type: "text", required: true, localized: true },
    { name: "ctaHref", type: "text", required: true },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional photo, bleeding in from one edge over the olive band. Renders as a flat olive band when empty.",
      },
    },
    {
      name: "imagePosition",
      type: "select",
      defaultValue: "right",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      admin: {
        condition: (_, siblingData: { backgroundImage?: unknown }) =>
          Boolean(siblingData.backgroundImage),
      },
    },
  ],
};
