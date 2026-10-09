"use server";

import { headers } from "next/headers";
import { submitEnquiry } from "@/modules/enquiries/application/submit-enquiry";
import type { Result } from "@/lib/result";
import type { EnquiryError } from "@/modules/enquiries/application/submit-enquiry";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function submitEnquiryAction(input: {
  values: unknown;
  honeypot: string;
  turnstileToken?: string | undefined;
}): Promise<Result<undefined, EnquiryError>> {
  const ip = await getClientIp();
  return submitEnquiry({ ...input, ip });
}
