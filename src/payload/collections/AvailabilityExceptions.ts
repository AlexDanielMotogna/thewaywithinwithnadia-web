import type { CollectionConfig } from "payload";

export const AvailabilityExceptions: CollectionConfig = {
  slug: "availability-exceptions",
  admin: {
    useAsTitle: "date",
    description:
      "One-off overrides to the recurring rules: blocked days or extra hours.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "date", type: "date", required: true },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Blocked (no availability)", value: "blocked" },
        { label: "Extra hours", value: "extra_hours" },
      ],
    },
    {
      name: "startTime",
      type: "text",
      admin: {
        description:
          "Required for 'Extra hours'. 24h local time, e.g. '14:00'.",
        condition: (_, siblingData: { type?: string }) =>
          siblingData.type === "extra_hours",
      },
    },
    {
      name: "endTime",
      type: "text",
      admin: {
        description:
          "Required for 'Extra hours'. 24h local time, e.g. '17:00'.",
        condition: (_, siblingData: { type?: string }) =>
          siblingData.type === "extra_hours",
      },
    },
    { name: "reason", type: "text" },
  ],
};
