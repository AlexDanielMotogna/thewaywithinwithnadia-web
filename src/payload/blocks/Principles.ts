import type { Block } from "payload";

export const Principles: Block = {
  slug: "principles",
  labels: { singular: "Principles", plural: "Principles" },
  fields: [
    { name: "heading", type: "text", localized: true },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        {
          name: "description",
          type: "textarea",
          required: true,
          localized: true,
        },
      ],
    },
  ],
};
