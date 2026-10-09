import { z } from "zod";

// No custom error messages here on purpose: validation copy is UI microcopy
// (ENGINEERING.md §3) and lives in messages/en.json + de.json, keyed by the
// Zod issue code at display time (see ui/enquiry-form.tsx).
export const enquiryFormSchema = z.object({
  propertyName: z.string().trim().min(1).max(200),
  contactPerson: z.string().trim().min(1).max(200),
  email: z.email(),
  phone: z.string().trim().max(50).optional(),
  location: z.string().trim().max(200).optional(),
  collaborationType: z.string().trim().max(200).optional(),
  preferredDates: z.string().trim().max(200).optional(),
  // The field is a plain text input (empty string when untouched) so an
  // empty value means "not provided", not zero.
  participants: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.coerce.number().int().min(0).optional(),
  ),
  message: z.string().trim().min(1).max(5000),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
