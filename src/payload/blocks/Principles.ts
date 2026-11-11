import type { Block } from "payload";
import {
  eyebrowField,
  iconField,
  scriptField,
  toneField,
} from "@/payload/blocks/fields";

/** Icon + title + short line, repeated. Used for principles, steps, guidelines. */
export const Principles: Block = {
  slug: "principles",
  labels: { singular: "Icon Row", plural: "Icon Rows" },
  fields: [
    eyebrowField,
    { name: "heading", type: "text", localized: true },
    scriptField("script", "Handwritten line under the heading."),
    {
      name: "variant",
      type: "select",
      defaultValue: "columns",
      options: [
        { label: "Columns with thin dividers", value: "columns" },
        { label: "Soft cards", value: "cards" },
      ],
    },
    {
      name: "numbered",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Prefix each title with 1., 2., 3. ..." },
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        iconField,
        { name: "title", type: "text", required: true, localized: true },
        {
          name: "description",
          type: "textarea",
          required: true,
          localized: true,
        },
      ],
    },
    scriptField("closing", "Optional handwritten closing line."),
    toneField,
  ],
};
