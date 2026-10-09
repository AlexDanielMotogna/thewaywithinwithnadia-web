import type { Media } from "@/payload-types";

/** Relationship fields come back as an id until `depth` populates them. */
export function resolveMedia(
  image: number | Media | null | undefined,
): Media | null {
  if (image && typeof image === "object") return image;
  return null;
}
