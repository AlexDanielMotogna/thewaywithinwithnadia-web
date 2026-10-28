import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Result } from "@/lib/result";

// Short, tamper-proof, expiring tokens: the OAuth `state` parameter today,
// signed session links later. Not encrypted: the payload is readable, so
// never put secrets in `data`.
const payloadSchema = z.object({ d: z.string(), exp: z.number() });

function sign(body: string, secret: string, purpose: string): Buffer {
  return createHmac("sha256", `${purpose}:${secret}`).update(body).digest();
}

export function signToken(input: {
  data: string;
  secret: string;
  purpose: string;
  expiresAt: Date;
}): string {
  const body = Buffer.from(
    JSON.stringify({ d: input.data, exp: input.expiresAt.getTime() }),
  ).toString("base64url");
  return `${body}.${sign(body, input.secret, input.purpose).toString("base64url")}`;
}

export function verifyToken(input: {
  token: string;
  secret: string;
  purpose: string;
  now: Date;
}): Result<string, { kind: "invalid" } | { kind: "expired" }> {
  const [body, signature] = input.token.split(".");
  if (!body || !signature) return { ok: false, error: { kind: "invalid" } };

  const expected = sign(body, input.secret, input.purpose);
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, error: { kind: "invalid" } };
  }

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, error: { kind: "invalid" } };
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };
  if (parsed.data.exp <= input.now.getTime()) {
    return { ok: false, error: { kind: "expired" } };
  }
  return { ok: true, value: parsed.data.d };
}
