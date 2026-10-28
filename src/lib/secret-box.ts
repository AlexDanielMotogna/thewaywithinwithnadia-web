import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import type { Result } from "@/lib/result";

// Encrypts secrets we must store, e.g. the Google refresh token (LEGAL.md
// §4.3.7, Art. 32). AES-256-GCM, so tampering is detected on open. The key
// is derived from PAYLOAD_SECRET plus a purpose label, so a value sealed for
// one purpose cannot be opened as another. Rotating PAYLOAD_SECRET makes
// existing values unreadable: the integration then has to be reconnected.
const VERSION = "v1";

function deriveKey(secret: string, purpose: string): Buffer {
  return createHash("sha256").update(`${purpose}:${secret}`).digest();
}

export function sealSecret(
  plaintext: string,
  secret: string,
  purpose: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret, purpose), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return [
    VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function openSecret(
  sealed: string,
  secret: string,
  purpose: string,
): Result<string, { kind: "invalid" }> {
  const [version, iv, tag, ciphertext] = sealed.split(".");
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    return { ok: false, error: { kind: "invalid" } };
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(secret, purpose),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return { ok: true, value: plaintext };
  } catch {
    return { ok: false, error: { kind: "invalid" } };
  }
}
