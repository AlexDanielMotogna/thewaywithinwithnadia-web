import type { GlobalConfig } from "payload";

// Editable copy shown on every service's booking page, below the calendar
// (Master Doc §15: content editable without a developer). Functional labels
// (step names, buttons) are UI microcopy in messages/*.json instead.
export const BookingPage: GlobalConfig = {
  slug: "booking-page",
  label: "Booking page",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "whatToExpect",
      type: "array",
      label: "What to expect",
      maxRows: 4,
      admin: { description: "Up to four short points, shown side by side." },
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "leaf",
          options: [
            { label: "Leaf", value: "leaf" },
            { label: "Sun", value: "sun" },
            { label: "Heart", value: "heart" },
            { label: "Lotus", value: "lotus" },
          ],
        },
        { name: "title", type: "text", required: true, localized: true },
        { name: "text", type: "textarea", required: true, localized: true },
      ],
    },
    {
      name: "beforeYouBook",
      type: "group",
      label: "Before you book",
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "text", type: "textarea", localized: true },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
