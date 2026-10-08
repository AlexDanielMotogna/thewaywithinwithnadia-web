import type { GlobalConfig } from "payload";

export const BookingSettings: GlobalConfig = {
  slug: "booking-settings",
  access: {
    // Not public: slot computation happens server-side (Phase 5), the
    // frontend never reads these rules directly over the API.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "timezone",
      type: "text",
      required: true,
      defaultValue: "Europe/Vienna",
      admin: { description: "IANA timezone, e.g. 'Europe/Vienna'." },
    },
    {
      name: "minNoticeMin",
      type: "number",
      required: true,
      defaultValue: 1440,
      admin: {
        description: "Minimum notice before a bookable slot, in minutes.",
      },
    },
    {
      name: "bufferMin",
      type: "number",
      required: true,
      defaultValue: 15,
      admin: { description: "Default buffer after a session, in minutes." },
    },
    {
      name: "stepMin",
      type: "number",
      required: true,
      defaultValue: 30,
      admin: { description: "Slot granularity, in minutes." },
    },
  ],
};
