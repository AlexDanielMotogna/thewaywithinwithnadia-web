import type { CollectionConfig } from "payload";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { active: { equals: true } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "tagline",
      type: "text",
      localized: true,
      maxLength: 48,
      admin: {
        description:
          "Short phrase in the script font under the title on the booking page, e.g. 'A dedicated time for you.' Optional.",
      },
    },
    {
      name: "shortDescription",
      type: "textarea",
      localized: true,
    },
    { name: "description", type: "richText", localized: true },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "durationMin",
      type: "number",
      min: 1,
      admin: {
        description:
          "Session duration in minutes. Leave empty until confirmed (PENDING.md).",
      },
    },
    {
      name: "price",
      type: "number",
      min: 0,
      admin: {
        description: "Leave empty until pricing is confirmed (PENDING.md).",
      },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "EUR",
      options: [{ label: "EUR", value: "EUR" }],
    },
    {
      name: "mode",
      type: "select",
      required: true,
      defaultValue: "both",
      options: [
        { label: "Online", value: "online" },
        { label: "In person", value: "in_person" },
        { label: "Both", value: "both" },
      ],
    },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "bookingEnabled", type: "checkbox", defaultValue: true },
  ],
};
