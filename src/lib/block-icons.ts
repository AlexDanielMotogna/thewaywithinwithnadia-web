/**
 * The fine-line icons an editor may pick for a page-builder item in the CMS.
 * Lives in lib (not ui) because Payload block schemas load in plain Node
 * and may not import React components; `ui/Icon.tsx` checks at compile time
 * that every name here exists in its registry.
 */
export const BLOCK_ICON_NAMES = [
  "sun",
  "lotus",
  "leaf",
  "heart",
  "compass",
  "waves",
  "infinity",
  "prayer",
  "book",
  "chat",
  "home",
  "laptop",
  "calendar",
  "users",
  "mail",
  "alert",
  "pulse",
] as const;

export type BlockIconName = (typeof BLOCK_ICON_NAMES)[number];

export function isBlockIconName(value: unknown): value is BlockIconName {
  return (
    typeof value === "string" && BLOCK_ICON_NAMES.some((name) => name === value)
  );
}
