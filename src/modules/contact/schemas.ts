import { z } from "zod";

// No custom error messages here on purpose: validation copy is UI microcopy
// (ENGINEERING.md §3) and lives in messages/en.json + de.json, keyed by the
// Zod issue code at display time (see ui/contact-form.tsx).
export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email(),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
