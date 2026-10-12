import { z } from "zod";

export const bookingFormSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  startsAt: z.iso.datetime(),
  mode: z.enum(["online", "in_person"]),
  clientName: z.string().trim().min(1).max(200),
  clientEmail: z.email(),
  clientPhone: z.string().trim().max(50).optional(),
  // LEGAL.md §4.3.2 — never collect health/special-category data here; the
  // UI must show a "please don't share health information" hint and this
  // field must never be required.
  notes: z.string().trim().max(2000).optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const getAvailableSlotsInputSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  from: z.iso.datetime(),
  to: z.iso.datetime(),
});

export type GetAvailableSlotsInput = z.infer<
  typeof getAvailableSlotsInputSchema
>;

export const rescheduleBookingInputSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  newStartsAt: z.iso.datetime(),
});

export type RescheduleBookingInput = z.infer<
  typeof rescheduleBookingInputSchema
>;
