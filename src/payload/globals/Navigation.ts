import type { GlobalConfig } from "payload";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "items",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true, localized: true },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};
