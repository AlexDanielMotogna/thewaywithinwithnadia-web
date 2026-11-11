import type { Field } from "payload";
import { BLOCK_ICON_NAMES } from "@/lib/block-icons";

/** Small letter-spaced overline above a heading, e.g. "A GENTLE WELCOME". */
export const eyebrowField: Field = {
  name: "eyebrow",
  type: "text",
  localized: true,
  admin: { description: "Optional small overline above the heading." },
};

/** One short handwritten-style line. Keep it to a single line. */
export function scriptField(name: string, description: string): Field {
  return {
    name,
    type: "text",
    localized: true,
    admin: { description },
  };
}

/** Fine-line icon picker (the closed set in src/lib/block-icons.ts). */
export const iconField: Field = {
  name: "icon",
  type: "select",
  options: BLOCK_ICON_NAMES.map((name) => ({ label: name, value: name })),
};

/** Background of a band: plain ivory or the slightly deeper soft sand. */
export const toneField: Field = {
  name: "tone",
  type: "select",
  defaultValue: "ivory",
  options: [
    { label: "Ivory", value: "ivory" },
    { label: "Soft sand", value: "soft" },
  ],
};
