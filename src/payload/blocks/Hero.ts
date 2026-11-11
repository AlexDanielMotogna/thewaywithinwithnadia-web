import type { Block } from "payload";
import { eyebrowField, scriptField } from "@/payload/blocks/fields";

export const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    {
      name: "layout",
      type: "select",
      defaultValue: "split",
      options: [
        { label: "Full photo, text over it (home)", value: "overlay" },
        { label: "Text left, photo right (inner pages)", value: "split" },
        { label: "Centred text, no photo", value: "centered" },
      ],
    },
    eyebrowField,
    { name: "heading", type: "text", required: true, localized: true },
    scriptField("script", "Handwritten line under the heading."),
    {
      name: "tagline",
      type: "text",
      localized: true,
      admin: {
        description:
          "Short letter-spaced line, e.g. 'Meditation · Breathwork · 1:1 Guidance'.",
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
