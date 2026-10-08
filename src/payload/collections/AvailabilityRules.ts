import type { CollectionConfig } from "payload";

export const AvailabilityRules: CollectionConfig = {
  slug: "availability-rules",
  admin: {
    useAsTitle: "weekday",
    description:
      "Recurring weekly availability windows, in business local time.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "weekday",
      type: "select",
      required: true,
      options: [
        { label: "Monday", value: "mon" },
        { label: "Tuesday", value: "tue" },
        { label: "Wednesday", value: "wed" },
        { label: "Thursday", value: "thu" },
        { label: "Friday", value: "fri" },
        { label: "Saturday", value: "sat" },
        { label: "Sunday", value: "sun" },
      ],
    },
    {
      name: "startTime",
      type: "text",
      required: true,
      admin: { description: "24h local time, e.g. '09:00'." },
    },
    {
      name: "endTime",
      type: "text",
      required: true,
      admin: { description: "24h local time, e.g. '13:00'." },
    },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
};
