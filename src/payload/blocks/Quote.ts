import type { Block } from "payload";

export const Quote: Block = {
  slug: "quote",
  labels: { singular: "Quote", plural: "Quotes" },
  fields: [
    { name: "text", type: "textarea", required: true, localized: true },
    { name: "attribution", type: "text", localized: true },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional full-bleed banner photo. Renders as a flat sand band when empty.",
      },
    },
  ],
};
