import type { Block } from "payload";
import { eyebrowField } from "@/payload/blocks/fields";

export const Cta: Block = {
  slug: "cta",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "light",
      options: [
        { label: "Light (cream, photo at the side)", value: "light" },
        { label: "Olive band", value: "olive" },
      ],
    },
    eyebrowField,
    { name: "heading", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", localized: true },
    { name: "ctaLabel", type: "text", required: true, localized: true },
    { name: "ctaHref", type: "text", required: true },
    { name: "secondaryCtaLabel", type: "text", localized: true },
    { name: "secondaryCtaHref", type: "text" },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional photo at one side of the band." },
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
