import type { Block } from "payload";
import { eyebrowField, scriptField } from "@/payload/blocks/fields";

export const ServicesPreview: Block = {
  slug: "servicesPreview",
  labels: { singular: "Services Preview", plural: "Services Preview" },
  fields: [
    eyebrowField,
    { name: "heading", type: "text", localized: true },
    scriptField("script", "Handwritten line under the heading."),
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
