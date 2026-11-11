import type { Block } from "payload";

export const Quote: Block = {
  slug: "quote",
  labels: { singular: "Quote", plural: "Quotes" },
  fields: [
    { name: "text", type: "textarea", required: true, localized: true },
    { name: "attribution", type: "text", localized: true },
    {
      name: "style",
      type: "select",
      defaultValue: "serif",
      options: [
        { label: "Serif italic", value: "serif" },
        { label: "Handwritten (keep it to one line)", value: "script" },
      ],
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional full-bleed banner photo. Renders on a soft band when empty.",
      },
    },
  ],
};
