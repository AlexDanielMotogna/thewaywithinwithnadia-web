import type { Block } from "payload";

export const ServicesPreview: Block = {
  slug: "servicesPreview",
  labels: { singular: "Services Preview", plural: "Services Preview" },
  fields: [
    { name: "heading", type: "text", localized: true },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: {
        description: "Leave empty to show featured services automatically.",
      },
    },
  ],
};
