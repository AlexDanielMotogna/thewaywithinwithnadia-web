import type { CollectionConfig } from "payload";

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  admin: {
    useAsTitle: "propertyName",
    defaultColumns: ["propertyName", "contactPerson", "status", "createdAt"],
  },
  access: {
    // Same reasoning as Bookings: the public enquiry form (Phase 4) submits
    // via a validated Server Action using the Local API, not direct REST.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "propertyName", type: "text", required: true },
    { name: "contactPerson", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "location", type: "text" },
    {
      name: "collaborationType",
      type: "text",
      admin: {
        description:
          "E.g. morning meditation, breathwork, retreat programme, wellbeing day.",
      },
    },
    { name: "preferredDates", type: "text" },
    { name: "participants", type: "number", min: 0 },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Closed", value: "closed" },
      ],
    },
  ],
};
