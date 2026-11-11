import NextLink from "next/link";
import type { TypedLocale } from "payload";
import { isBlockIconName } from "@/lib/block-icons";
import { blockIcon, Container, Heading, Icon, IconBadge } from "@/ui";
import { localizeHref } from "@/modules/content/ui/localize-href";
import type { NoticeBlockData } from "@/modules/content/ui/types";

export function NoticeBlock({
  icon,
  heading,
  body,
  linkLabel,
  linkHref,
  locale,
}: NoticeBlockData & { locale: TypedLocale }) {
  return (
    <section className="bg-ivory py-10 sm:py-14">
      <Container>
        <div className="bg-ivory-dark border-sand flex flex-col items-center gap-6 rounded-lg border px-6 py-8 text-center sm:flex-row sm:px-10 sm:text-left">
          {isBlockIconName(icon) ? (
            <IconBadge name={blockIcon(icon)} size="lg" />
          ) : null}
          <div className="flex flex-col gap-2">
            <Heading as="h2" size="sm">
              {heading}
            </Heading>
            <p className="text-charcoal/80 leading-relaxed">{body}</p>
            {linkLabel && linkHref ? (
              <NextLink
                href={localizeHref(linkHref, locale)}
                className="text-terracotta hover:text-olive-dark mt-1 inline-flex items-center gap-1.5 self-center text-sm underline underline-offset-4 sm:self-start"
              >
                {linkLabel}
                <Icon name="arrowRight" size={14} />
              </NextLink>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
