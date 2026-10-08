import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "email", type: "email" },
    { name: "phone", type: "text" },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "LinkedIn", value: "linkedin" },
          ],
        },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "music",
      type: "group",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Stays off until track licensing is confirmed — see PENDING.md.",
          },
        },
        { name: "track", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "analytics",
      type: "group",
      fields: [{ name: "ga4Id", type: "text" }],
    },
    {
      name: "seoDefaults",
      type: "group",
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
      ],
    },
  ],
};
