"use server";

import { headers } from "next/headers";
import { submitContactMessage } from "@/modules/contact/application/submit-contact-message";
import type { Result } from "@/lib/result";
import type { ContactMessageError } from "@/modules/contact/application/submit-contact-message";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function submitContactMessageAction(input: {
  values: unknown;
  honeypot: string;
  turnstileToken?: string | undefined;
}): Promise<Result<undefined, ContactMessageError>> {
  const ip = await getClientIp();
  return submitContactMessage({ ...input, ip });
}
