import type { CollectionConfig } from "payload";

// Status set matches the state machine in ENGINEERING.md §5.4 — transitions
// are enforced in application code (Phase 5), not here. This is the data
// shape only; the exclusion constraint preventing double-booking is added
// via a hand-written migration in Phase 5 (ENGINEERING.md §5.3).
export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "clientName",
    defaultColumns: ["clientName", "service", "startsAt", "status"],
  },
  access: {
    // No public create/read: the real booking flow (Phase 5) goes through a
    // validated Server Action using Payload's Local API, which bypasses
    // `access` by default — this only governs direct REST/GraphQL/admin use.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "clientName", type: "text", required: true },
    { name: "clientEmail", type: "email", required: true },
    { name: "clientPhone", type: "text" },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      required: true,
    },
    { name: "startsAt", type: "date", required: true },
    {
      name: "durationMin",
      type: "number",
      required: true,
      admin: {
        description: "Snapshot of the service duration at booking time.",
      },
    },
    {
      name: "mode",
      type: "select",
      required: true,
      options: [
        { label: "Online", value: "online" },
        { label: "In person", value: "in_person" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Rescheduled", value: "rescheduled" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Completed", value: "completed" },
        { label: "No-show", value: "no_show" },
      ],
    },
    { name: "meetingUrl", type: "text" },
    {
      name: "calendarEventId",
      type: "text",
      admin: { description: "Idempotency key for the calendar-sync job." },
    },
    { name: "confirmationSentAt", type: "date" },
    { name: "notes", type: "textarea" },
    {
      name: "priceAmount",
      type: "number",
      admin: { description: "Snapshot of the price at booking time." },
    },
    { name: "currency", type: "text", defaultValue: "EUR" },
  ],
};
