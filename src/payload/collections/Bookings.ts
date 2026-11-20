import type { CollectionConfig } from "payload";
import { enforceBookingStatus } from "@/payload/hooks/enforce-booking-status";
import {
  queueBookingJobsAfterChange,
  queueBookingJobsAfterDelete,
} from "@/payload/hooks/queue-booking-jobs";

// Status set matches the state machine in ENGINEERING.md §5.4. The
// `beforeChange` guard runs the same state machine on every write, admin
// edits included. The exclusion constraint preventing double-booking lives
// in a hand-written migration (ENGINEERING.md §5.3).
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
  hooks: {
    beforeChange: [enforceBookingStatus],
    afterChange: [queueBookingJobsAfterChange],
    afterDelete: [queueBookingJobsAfterDelete],
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
      name: "bufferMin",
      type: "number",
      required: true,
      defaultValue: 15,
      admin: {
        description:
          "Snapshot of BookingSettings.bufferMin at booking time. A DB " +
          "trigger uses it to maintain 'blocked_until', which backs the " +
          "double-booking exclusion constraint (ENGINEERING.md §5.3) — do " +
          "not rename without updating that migration.",
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
    {
      name: "locale",
      type: "select",
      required: true,
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Deutsch", value: "de" },
      ],
      admin: { description: "Language the client booked in; emails use it." },
    },
    // Idempotency markers for the notification jobs (ENGINEERING.md §5.5):
    // each one is set once its email went out, so a retry never resends it.
    { name: "confirmationSentAt", type: "date" },
    { name: "ownerNotifiedAt", type: "date" },
    { name: "cancellationSentAt", type: "date" },
    { name: "notes", type: "textarea" },
    {
      name: "priceAmount",
      type: "number",
      admin: { description: "Snapshot of the price at booking time." },
    },
    { name: "currency", type: "text", defaultValue: "EUR" },
  ],
};
