import type { SVGProps } from "react";

/**
 * Fine-line spiritual/sun/lotus iconography (Master Doc §3). A small, closed
 * registry — add icons here, never inline one-off SVGs in page components.
 */
const icons = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  lotus: (
    <>
      <path d="M12 21c-3.5-1.5-6-4.8-6-8.5C6 9 8 6 12 3c4 3 6 6 6 9.5 0 3.7-2.5 7-6 8.5Z" />
      <path d="M12 21V10" />
      <path d="M6 14c1.8 0 3.6.8 4.8 2M18 14c-1.8 0-3.6.8-4.8 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 6.5 8 6.5 8-6.5" />
    </>
  ),
  phone: (
    <path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2L21 15v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9Z" />
    </>
  ),
} as const;

export type IconName = keyof typeof icons;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
