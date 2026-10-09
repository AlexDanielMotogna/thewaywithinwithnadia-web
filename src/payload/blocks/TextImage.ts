import type { Block } from "payload";

export const TextImage: Block = {
  slug: "textImage",
  labels: { singular: "Text + Image", plural: "Text + Image" },
  fields: [
    { name: "heading", type: "text", localized: true },
    { name: "richText", type: "richText", localized: true },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional — real photography is pending (PENDING.md). Renders as text-only when empty.",
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
    },
  ],
};
