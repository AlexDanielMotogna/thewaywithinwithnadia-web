import type { CollectionConfig } from "payload";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "status", "createdAt"],
  },
  access: {
    // Same reasoning as Bookings/Enquiries: the public contact form submits
    // via a validated Server Action using the Local API, which bypasses
    // `access` — this only governs direct REST/GraphQL/admin use.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Replied", value: "replied" },
        { label: "Closed", value: "closed" },
      ],
    },
  ],
};
