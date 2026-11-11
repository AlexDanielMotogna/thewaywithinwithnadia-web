"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants, Icon, Logo } from "@/ui";
import { LanguageSwitcher } from "@/modules/content/ui/language-switcher";
import type { NavItem } from "@/modules/content/ui/nav-items";

type SiteNavProps = {
  items: NavItem[];
  labels: {
    home: string;
    book: string;
    openMenu: string;
    closeMenu: string;
    main: string;
  };
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items, labels }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Close the mobile menu whenever the route changes.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const bookActive = isActive(pathname, "/book");

  return (
    <header className="bg-ivory/95 border-sand/70 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label={labels.home}
          className="focus-visible:outline-gold shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Logo />
        </Link>

        <nav aria-label={labels.main} className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "duration-fast border-b py-1 text-[0.9rem] transition-colors",
                      active
                        ? "text-terracotta border-terracotta"
                        : "text-charcoal/80 hover:text-olive-dark border-transparent",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>
          <Link
            href="/book"
            aria-current={bookActive ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "primary", size: "md" }),
              "hidden sm:inline-flex",
            )}
          >
            {labels.book}
            <Icon name="arrowRight" size={16} />
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? labels.closeMenu : labels.openMenu}
            onClick={() => {
              setOpen((value) => !value);
            }}
            className="text-olive-dark hover:bg-sand/60 focus-visible:outline-gold flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 xl:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className="border-sand/70 bg-ivory border-t xl:hidden"
      >
        <nav aria-label={labels.main} className="px-6 pt-4 pb-8">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-sand/60 border-b">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center font-serif text-2xl",
                      active ? "text-terracotta" : "text-olive-dark",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/book"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              {labels.book}
              <Icon name="arrowRight" size={16} />
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
