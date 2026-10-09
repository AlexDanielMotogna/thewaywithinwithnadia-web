"use client";

import { useRef, useState } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ): void;
    };
  }
}

type TurnstileWidgetProps = {
  /** Only load the Cloudflare script once the user starts interacting with
   * the form (LEGAL.md §5.1) — never on page load. */
  armed: boolean;
  onVerify: (token: string) => void;
};

/**
 * Feature-flagged like the music player (ENGINEERING.md §7.4 pattern): no
 * site key configured yet (PENDING.md #10) means this renders nothing, not
 * a fabricated widget.
 */
export function TurnstileWidget({ armed, onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  if (!SITE_KEY || !armed) return null;

  return (
    <>
      <div ref={containerRef} />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onReady={() => {
          if (rendered || !containerRef.current || !window.turnstile) return;
          window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: onVerify,
          });
          setRendered(true);
        }}
      />
    </>
  );
}
