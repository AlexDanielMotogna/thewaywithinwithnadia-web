import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Result } from "@/lib/result";

export type ProtectionError =
  | { kind: "honeypot" }
  | { kind: "rate_limited" }
  | { kind: "turnstile_failed" };

type ProtectPublicActionInput = {
  /** Hidden form field that must stay empty — filling it means a bot. */
  honeypot: string;
  /** e.g. `contact:${ip}` — scoped per action per client. */
  rateLimitKey: string;
  rateLimit?: { max: number; windowMs: number };
  turnstileToken?: string | undefined;
};

const turnstileResponseSchema = z.object({ success: z.boolean() });

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  // Not configured yet (PENDING.md #10) — the boundary exists, but there's
  // nothing to verify against, so this step is skipped rather than fabricated.
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );
  const parsed = turnstileResponseSchema.safeParse(await response.json());
  return parsed.success && parsed.data.success;
}

/**
 * Shared spam-protection wrapper for public form submissions
 * (ENGINEERING.md §7.2): honeypot, then rate limit, then Turnstile.
 */
export async function protectPublicAction(
  input: ProtectPublicActionInput,
): Promise<Result<undefined, ProtectionError>> {
  if (input.honeypot !== "") return { ok: false, error: { kind: "honeypot" } };

  const withinLimit = checkRateLimit(
    input.rateLimitKey,
    input.rateLimit ?? { max: 5, windowMs: 10 * 60 * 1000 },
  );
  if (!withinLimit) return { ok: false, error: { kind: "rate_limited" } };

  const turnstileOk = await verifyTurnstile(input.turnstileToken);
  if (!turnstileOk) return { ok: false, error: { kind: "turnstile_failed" } };

  return { ok: true, value: undefined };
}
