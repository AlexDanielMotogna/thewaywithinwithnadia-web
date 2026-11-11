import type { Block } from "payload";
import { iconField } from "@/payload/blocks/fields";

/** A soft framed note, e.g. "A Gentle Reminder" (not medical care). */
export const Notice: Block = {
  slug: "notice",
  labels: { singular: "Notice", plural: "Notices" },
  fields: [
    iconField,
    { name: "heading", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", required: true, localized: true },
    { name: "linkLabel", type: "text", localized: true },
    { name: "linkHref", type: "text" },
  ],
};
