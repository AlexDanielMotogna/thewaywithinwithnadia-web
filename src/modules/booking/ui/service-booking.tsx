"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Service } from "@/payload-types";
import {
  createBookingAction,
  type SerializedSlot,
} from "@/modules/booking/actions";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/modules/booking/schemas";
import {
  displayTimeZoneFor,
  formatSlotDate,
  formatSlotTime,
  SlotCalendar,
  type SlotMode,
} from "@/modules/booking/ui/slot-calendar";
import {
  Button,
  FormField,
  Heading,
  Icon,
  Input,
  Textarea,
  TurnstileWidget,
  useZodForm,
} from "@/ui";

type Step = "time" | "details" | "review";
type SubmitError =
  "error" | "rate_limited" | "slot_taken" | "invalid" | "service_unavailable";

const STEP_ORDER: Step[] = ["time", "details", "review"];

function modesOf(service: Service): SlotMode[] {
  if (service.mode === "online") return ["online"];
  if (service.mode === "in_person") return ["in_person"];
  return ["online", "in_person"];
}

function fieldErrorMessage(
  type: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string | undefined {
  if (!type) return undefined;
  if (type === "invalid_format") return t("Booking.errors.invalidEmail");
  return t("Booking.errors.required");
}

function formatPrice(service: Service, locale: string): string | null {
  // Nothing is charged through the site; a price is only shown when the
  // service has one (PENDING.md #13, #18).
  if (!service.price) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: service.currency,
  }).format(service.price);
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-5">
      <Heading as="h2" size="sm" className="text-olive">
        {children}
      </Heading>
      <span aria-hidden="true" className="bg-gold mt-2 block h-px w-10" />
    </div>
  );
}

export function ServiceBooking({
  service,
  locale,
}: {
  service: Service;
  locale: "en" | "de";
}) {
  const t = useTranslations();
  const modes = modesOf(service);
  const [mode, setMode] = useState<SlotMode>(modes[0] ?? "online");
  const [step, setStep] = useState<Step>("time");
  const [timezone, setTimezone] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SerializedSlot | null>(null);
  // Bumped to remount the calendar, which fetches fresh times.
  const [calendarKey, setCalendarKey] = useState(0);
  const [error, setError] = useState<SubmitError | null>(null);
  const [done, setDone] = useState(false);
  const [armed, setArmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const detailsHeadingRef = useRef<HTMLHeadingElement>(null);
  const calendarRef = useRef<HTMLElement>(null);
  const moveFocusTo = useRef<"details" | "calendar" | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useZodForm(bookingFormSchema);

  // After a step change, bring the next part into view and move focus
  // there, so keyboard and screen-reader users follow along.
  useEffect(() => {
    const target = moveFocusTo.current;
    if (!target) return;
    moveFocusTo.current = null;
    const element =
      target === "details" ? detailsHeadingRef.current : calendarRef.current;
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    element?.focus({ preventScroll: true });
  }, [step, selectedSlot, calendarKey]);

  const displayTimeZone = displayTimeZoneFor(mode, timezone);
  const timeZoneLabel =
    displayTimeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const price = formatPrice(service, locale);

  function chooseMode(next: SlotMode) {
    setMode(next);
    setSelectedSlot(null);
    setStep("time");
    setError(null);
  }

  function chooseSlot(slot: SerializedSlot) {
    setSelectedSlot(slot);
    setValue("serviceId", service.id);
    setValue("mode", mode);
    setValue("locale", locale);
    setValue("startsAt", slot.start);
    setError(null);
    if (step === "time") setStep("details");
    moveFocusTo.current = "details";
  }

  async function continueToReview() {
    const valid = await trigger([
      "clientName",
      "clientEmail",
      "clientPhone",
      "notes",
    ]);
    if (valid) {
      setStep("review");
      moveFocusTo.current = "details";
    }
  }

  const onSubmit = (values: BookingFormValues) => {
    const honeypot = honeypotRef.current?.value ?? "";
    startTransition(() => {
      void createBookingAction({ values, honeypot, turnstileToken }).then(
        (result) => {
          if (result.ok) {
            setDone(true);
            return;
          }
          const { kind } = result.error;
          if (kind === "slot_taken") {
            // Back to the calendar with fresh times; name and email stay
            // filled in (LEGAL.md §3.2: never ask for the same data twice).
            setSelectedSlot(null);
            setStep("time");
            setCalendarKey((key) => key + 1);
            moveFocusTo.current = "calendar";
            setError("slot_taken");
          } else if (kind === "rate_limited") setError("rate_limited");
          else if (kind === "invalid") setError("invalid");
          else if (kind === "service_unavailable")
            setError("service_unavailable");
          else setError("error");
        },
      );
    });
  };

  if (done && selectedSlot) {
    return (
      <div
        role="status"
        className="bg-sand/50 mx-auto flex max-w-xl flex-col items-center gap-3 rounded-md p-8 text-center"
      >
        <Icon name="lotus" size={32} className="text-gold" aria-hidden="true" />
        <p className="text-olive font-serif text-2xl">{t("Booking.success")}</p>
        <p className="text-charcoal/80 text-sm">
          {service.name} ·{" "}
          {formatSlotDate(selectedSlot.start, displayTimeZone, locale)},{" "}
          {formatSlotTime(selectedSlot.start, displayTimeZone, locale)} (
          {timeZoneLabel})
        </p>
      </div>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const stepLabel = t("Booking.stepLabel", {
    step: stepIndex + 1,
    total: STEP_ORDER.length,
    label: t(`Booking.steps.${step}`),
  });

  return (
    <div className="flex flex-col gap-12">
      <p className="text-olive text-sm font-medium">{stepLabel}</p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <section
          aria-labelledby="choose-session"
          className="flex flex-col gap-6"
        >
          <div id="choose-session">
            <SectionTitle>{t("Booking.chooseSession")}</SectionTitle>
          </div>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">{t("Booking.chooseSession")}</legend>
            {modes.map((option) => (
              <label
                key={option}
                className={cn(
                  "duration-fast flex cursor-pointer items-start gap-4 rounded-md border bg-white/50 p-4 transition-colors",
                  "has-[:focus-visible]:outline-gold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                  mode === option
                    ? "border-gold bg-sand/40"
                    : "border-sand-dark hover:border-gold",
                )}
              >
                <input
                  type="radio"
                  name="session-mode"
                  value={option}
                  checked={mode === option}
                  onChange={() => {
                    chooseMode(option);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="bg-sand text-gold-dark flex size-12 shrink-0 items-center justify-center rounded-full"
                >
                  <Icon name={option === "online" ? "sun" : "leaf"} size={22} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-olive font-serif text-lg leading-tight">
                    {t(`Booking.mode.${option}.title`)}
                  </span>
                  <span className="text-charcoal/70 text-xs">
                    {t("Booking.serviceCard.durationLabel", {
                      min: service.durationMin ?? 0,
                    })}
                  </span>
                  <span className="text-charcoal/80 text-sm">
                    {t(`Booking.mode.${option}.text`)}
                  </span>
                </span>
                {price ? (
                  <span className="text-olive font-serif text-lg">{price}</span>
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    mode === option ? "border-olive" : "border-sand-dark",
                  )}
                >
                  {mode === option ? (
                    <span className="bg-olive size-2.5 rounded-full" />
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>

          <aside className="bg-sand/50 flex gap-4 rounded-md p-5">
            <span
              aria-hidden="true"
              className="bg-ivory text-gold-dark flex size-12 shrink-0 items-center justify-center rounded-full"
            >
              <Icon name="leaf" size={22} />
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-olive font-serif text-lg">
                {t("Booking.notSure.title")}
              </p>
              <p className="text-charcoal/80 text-sm">
                {t("Booking.notSure.text")}
              </p>
              <Link
                href="/contact"
                className="text-olive self-start text-sm underline underline-offset-4"
              >
                {t("Booking.notSure.link")}
              </Link>
            </div>
          </aside>
        </section>

        <section
          ref={calendarRef}
          tabIndex={-1}
          aria-labelledby="select-date-time"
          className="flex flex-col outline-none"
        >
          <div id="select-date-time">
            <SectionTitle>{t("Booking.selectDateTime")}</SectionTitle>
          </div>
          {error === "slot_taken" ? (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {t("Booking.slotTaken")}
            </p>
          ) : null}
          <SlotCalendar
            key={`${mode}-${String(calendarKey)}`}
            serviceId={service.id}
            mode={mode}
            locale={locale}
            selected={selectedSlot}
            onSelect={chooseSlot}
            onTimezone={setTimezone}
          />
        </section>
      </div>

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        onFocus={() => {
          setArmed(true);
        }}
        noValidate
        hidden={!selectedSlot}
        className="bg-sand/30 mx-auto w-full max-w-2xl rounded-md p-6 sm:p-8"
      >
        {/* Honeypot: hidden from sighted and AT users, left in the DOM for bots. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="booking-website">Website</label>
          <input
            ref={honeypotRef}
            id="booking-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {selectedSlot ? (
          <div className="mb-6 flex flex-col gap-1">
            <h2
              ref={detailsHeadingRef}
              tabIndex={-1}
              className="text-olive font-serif text-2xl outline-none"
            >
              {step === "review"
                ? t("Booking.review.title")
                : t("Booking.steps.details")}
            </h2>
            <p className="text-charcoal/80 text-sm">
              {service.name} ·{" "}
              {formatSlotDate(selectedSlot.start, displayTimeZone, locale)},{" "}
              {formatSlotTime(selectedSlot.start, displayTimeZone, locale)} (
              {timeZoneLabel})
            </p>
          </div>
        ) : null}

        <div hidden={step !== "details"} className="flex flex-col gap-4">
          <FormField
            label={t("Booking.details.name")}
            required
            error={fieldErrorMessage(errors.clientName?.type, t)}
          >
            {(field) => (
              <Input
                {...field}
                {...register("clientName")}
                type="text"
                autoComplete="name"
              />
            )}
          </FormField>

          <FormField
            label={t("Booking.details.email")}
            required
            error={fieldErrorMessage(errors.clientEmail?.type, t)}
          >
            {(field) => (
              <Input
                {...field}
                {...register("clientEmail")}
                type="email"
                autoComplete="email"
              />
            )}
          </FormField>

          <FormField label={t("Booking.details.phone")}>
            {(field) => (
              <Input
                {...field}
                {...register("clientPhone")}
                type="tel"
                autoComplete="tel"
              />
            )}
          </FormField>

          <FormField
            label={t("Booking.details.notes")}
            description={t("Booking.details.notesHint")}
          >
            {(field) => <Textarea {...field} {...register("notes")} rows={3} />}
          </FormField>

          <Button
            type="button"
            className="self-start"
            onClick={() => {
              void continueToReview();
            }}
          >
            {t("Booking.details.continue")}
          </Button>
        </div>

        {step === "review" && selectedSlot ? (
          <div className="flex flex-col gap-4">
            <dl className="text-charcoal/80 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="font-medium">{t("Booking.review.service")}</dt>
              <dd>{service.name}</dd>
              <dt className="font-medium">{t("Booking.review.mode")}</dt>
              <dd>
                {mode === "online"
                  ? t("Booking.review.modeOnline")
                  : t("Booking.review.modeInPerson")}
              </dd>
              <dt className="font-medium">{t("Booking.review.dateTime")}</dt>
              <dd>
                {formatSlotDate(selectedSlot.start, displayTimeZone, locale)},{" "}
                {formatSlotTime(selectedSlot.start, displayTimeZone, locale)} (
                {timeZoneLabel})
              </dd>
              <dt className="font-medium">{t("Booking.review.duration")}</dt>
              <dd>
                {t("Booking.serviceCard.durationLabel", {
                  min: service.durationMin ?? 0,
                })}
              </dd>
              {price ? (
                <>
                  <dt className="font-medium">{t("Booking.review.price")}</dt>
                  <dd>{price}</dd>
                </>
              ) : null}
            </dl>

            <p className="text-charcoal/70 text-xs">
              {t("Booking.review.cancellationNote")}
            </p>

            <TurnstileWidget armed={armed} onVerify={setTurnstileToken} />

            {error && error !== "slot_taken" ? (
              <p role="alert" className="text-sm text-red-700">
                {error === "rate_limited"
                  ? t("Booking.rateLimited")
                  : error === "invalid"
                    ? t("Booking.invalid")
                    : error === "service_unavailable"
                      ? t("Booking.serviceUnavailable")
                      : t("Booking.genericError")}
              </p>
            ) : null}

            <p className="text-charcoal/70 text-xs">
              {t("Booking.privacyNotice")}{" "}
              <Link href="/datenschutz" className="text-olive underline">
                {t("Booking.privacyLinkLabel")}
              </Link>
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("details");
                  moveFocusTo.current = "details";
                }}
              >
                {t("Booking.back")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("Booking.submitting")
                  : price
                    ? t("Booking.payButton")
                    : t("Booking.confirmButton")}
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
