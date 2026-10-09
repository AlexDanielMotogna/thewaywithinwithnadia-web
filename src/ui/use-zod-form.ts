"use client";

import { useForm, type FieldValues, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * One form hook for Contact, Enquiry and Booking (ENGINEERING.md §7.2):
 * React Hook Form + a Zod schema as the single source of validation truth,
 * shared with the server action that re-validates the same schema.
 */
export function useZodForm<
  TOutput extends FieldValues,
  TInput extends FieldValues = TOutput,
>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, "resolver">,
) {
  return useForm<TInput, unknown, TOutput>({
    ...options,
    resolver: zodResolver(schema),
  });
}
