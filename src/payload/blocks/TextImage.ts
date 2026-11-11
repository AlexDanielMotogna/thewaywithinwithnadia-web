import type { Block } from "payload";
import { eyebrowField, scriptField, toneField } from "@/payload/blocks/fields";

export const TextImage: Block = {
  slug: "textImage",
  labels: { singular: "Text + Image", plural: "Text + Image" },
  fields: [
    eyebrowField,
    { name: "heading", type: "text", localized: true },
    {
      name: "headingStyle",
      type: "select",
      defaultValue: "serif",
      options: [
        { label: "Serif", value: "serif" },
        { label: "Handwritten", value: "script" },
      ],
    },
    scriptField("script", "Handwritten line under the heading."),
    { name: "richText", type: "richText", localized: true },
    {
      name: "highlight",
      type: "textarea",
      localized: true,
      admin: { description: "Optional sentence shown in a soft framed box." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional. Renders as text-only when empty." },
    },
    {
      name: "imagePosition",
      type: "select",
      defaultValue: "right",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    {
      name: "imageShape",
      type: "select",
      defaultValue: "bleed",
      options: [
        { label: "Full height, to the edge", value: "bleed" },
        { label: "Arch (rounded top)", value: "arch" },
        { label: "Framed", value: "framed" },
      ],
    },
    toneField,
    scriptField(
      "asideNote",
      "Optional handwritten note in the corner, e.g. 'You are already enough.'",
    ),
    { name: "ctaLabel", type: "text", localized: true },
    { name: "ctaHref", type: "text" },
  ],
};
