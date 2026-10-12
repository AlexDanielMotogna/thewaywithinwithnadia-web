"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Service } from "@/payload-types";
import {
  createBookingAction,
  getAvailableSlotsAction,
  type SerializedSlot,
} from "@/modules/booking/actions";
import { type BookingFormValues } from "@/modules/booking/schemas";
import {
  Button,
  FormField,
  Input,
  Textarea,
  TurnstileWidget,
  useZodForm,
} from "@/ui";
import { bookingFormSchema } from "@/modules/booking/schemas";

type Step = "service" | "slot" | "details" | "review";
type Mode = "online" | "in_person";
type SubmitState =
  | "idle"
  | "success"
  | "error"
  | "rate_limited"
  | "slot_taken"
  | "invalid"
  | "service_unavailable";

const STEP_ORDER: Step[] = ["service", "slot", "details", "review"];
const RANGE_DAYS = 14;

function fieldErrorMessage(
  type: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string | undefined {
  if (!type) return undefined;
  if (type === "invalid_format") return t("Booking.errors.invalidEmail");
  return t("Booking.errors.required");
}

function formatPrice(service: Service, locale: string): string {
  if (service.price === null || service.price === undefined) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: service.currency,
  }).format(service.price);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateKey(iso: string, timeZone: string | undefined): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatDateHeading(
  iso: string,
  timeZone: string | undefined,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function formatTime(
  iso: string,
  timeZone: string | undefined,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function BookingFlow({
  services,
  locale,
}: {
  services: Service[];
  locale: string;
}) {
  const t = useTranslations();
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  // Both start `null`: reading the current time during the initial render
  // would bake "now" into the prerendered/cached HTML (Next 16 Cache
  // Components rejects this). Set for real inside `chooseService`, an
  // event handler — the slot step (the only place these are read) never
  // renders before that has run once.
  const [today, setToday] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [slots, setSlots] = useState<SerializedSlot[]>([]);
  const [timezone, setTimezone] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SerializedSlot | null>(null);
  const [armed, setArmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [state, setState] = useState<SubmitState>("idle");
  const [isPending, startTransition] = useTransition();
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useZodForm(bookingFormSchema);

  const displayTimeZone = mode === "online" ? undefined : timezone;

  useEffect(() => {
    if (step !== "slot" || !service || !mode || !rangeStart) return undefined;
    let cancelled = false;
    const from = rangeStart;
    const to = new Date(from);
    to.setDate(to.getDate() + RANGE_DAYS);

    void getAvailableSlotsAction({
      serviceId: service.id,
      from: from.toISOString(),
      to: to.toISOString(),
    }).then((result) => {
      if (cancelled) return;
      setLoadingSlots(false);
      if (result.ok) {
        setSlots(result.value.slots);
        setTimezone(result.value.timezone);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, service, mode, rangeStart]);

  const groupedSlots = useMemo(() => {
    const groups = new Map<
      string,
      { heading: string; slots: SerializedSlot[] }
    >();
    for (const slot of slots) {
      const key = dateKey(slot.start, displayTimeZone);
      const existing = groups.get(key);
      if (existing) {
        existing.slots.push(slot);
      } else {
        groups.set(key, {
          heading: formatDateHeading(slot.start, displayTimeZone, locale),
          slots: [slot],
        });
      }
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots, displayTimeZone, locale]);

  function chooseService(nextService: Service, nextMode: Mode) {
    const now = startOfDay(new Date());
    setService(nextService);
    setMode(nextMode);
    setValue("serviceId", nextService.id);
    setValue("mode", nextMode);
    setToday(now);
    setRangeStart(now);
    setLoadingSlots(true);
    setSlots([]);
    setStep("slot");
  }

  function chooseSlot(slot: SerializedSlot) {
    setSelectedSlot(slot);
    setValue("startsAt", slot.start);
    setStep("details");
  }

  async function continueToReview() {
    const valid = await trigger([
      "clientName",
      "clientEmail",
      "clientPhone",
      "notes",
    ]);
    if (valid) setStep("review");
  }

  const onSubmit = (values: BookingFormValues) => {
    const honeypot = honeypotRef.current?.value ?? "";
    startTransition(() => {
      void createBookingAction({ values, honeypot, turnstileToken }).then(
        (result) => {
          if (result.ok) {
            setState("success");
            return;
          }
          if (result.error.kind === "slot_taken") setState("slot_taken");
          else if (result.error.kind === "rate_limited")
            setState("rate_limited");
          else if (result.error.kind === "invalid") setState("invalid");
          else if (result.error.kind === "service_unavailable")
            setState("service_unavailable");
          else setState("error");
        },
      );
    });
  };

  if (services.length === 0) {
    return (
      <p className="text-charcoal/80">
        {t("Booking.noServices")} {t("Booking.noServicesContact")}{" "}
        <Link href="/contact" className="text-olive underline">
          {t("Booking.contactLinkLabel")}
        </Link>
        .
      </p>
    );
  }

  if (state === "success") {
    return <p className="text-olive-dark">{t("Booking.success")}</p>;
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-olive text-sm font-medium">
        {t("Booking.stepLabel", {
          step: stepIndex + 1,
          total: STEP_ORDER.length,
          label: t(`Booking.steps.${step}`),
        })}
      </p>

      {step === "service" ? (
        <ul className="flex flex-col gap-4">
          {services.map((svc) => (
            <li
              key={svc.id}
              className="border-sand flex flex-col gap-3 rounded-md border p-4"
            >
              <div>
                <p className="text-olive font-serif text-lg">{svc.name}</p>
                {svc.shortDescription ? (
                  <p className="text-charcoal/70 text-sm">
                    {svc.shortDescription}
                  </p>
                ) : null}
                <p className="text-charcoal/60 text-xs">
                  {t("Booking.serviceCard.durationLabel", {
                    min: svc.durationMin ?? 0,
                  })}
                  {" · "}
                  {formatPrice(svc, locale)}
                </p>
              </div>
              <div className="flex gap-2">
                {svc.mode !== "in_person" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      chooseService(svc, "online");
                    }}
                  >
                    {t("Booking.serviceCard.selectOnline")}
                  </Button>
                ) : null}
                {svc.mode !== "online" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      chooseService(svc, "in_person");
                    }}
                  >
                    {t("Booking.serviceCard.selectInPerson")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {step === "slot" && service && mode && today && rangeStart ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={rangeStart.getTime() <= today.getTime()}
              onClick={() => {
                const prev = new Date(rangeStart);
                prev.setDate(prev.getDate() - RANGE_DAYS);
                setLoadingSlots(true);
                setRangeStart(prev.getTime() < today.getTime() ? today : prev);
              }}
            >
              {t("Booking.slotPicker.previous")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = new Date(rangeStart);
                next.setDate(next.getDate() + RANGE_DAYS);
                setLoadingSlots(true);
                setRangeStart(next);
              }}
            >
              {t("Booking.slotPicker.next")}
            </Button>
          </div>

          {timezone ? (
            <p className="text-charcoal/60 text-xs">
              {mode === "online"
                ? t("Booking.slotPicker.timezoneLabelOnline", {
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })
                : t("Booking.slotPicker.timezoneLabelInPerson", {
                    tz: timezone,
                  })}
            </p>
          ) : null}

          {loadingSlots ? (
            <p className="text-charcoal/60 text-sm">
              {t("Booking.slotPicker.loading")}
            </p>
          ) : groupedSlots.length === 0 ? (
            <p className="text-charcoal/60 text-sm">
              {t("Booking.slotPicker.empty")}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {groupedSlots.map(([key, group]) => (
                <div key={key}>
                  <p className="text-olive mb-2 text-sm font-medium">
                    {group.heading}
                  </p>
                  <div
                    role="group"
                    aria-label={group.heading}
                    className="flex flex-wrap gap-2"
                  >
                    {group.slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => {
                          chooseSlot(slot);
                        }}
                        className="border-sand hover:border-olive hover:text-olive min-h-11 min-w-11 rounded-md border px-3 py-2 text-sm"
                      >
                        {formatTime(slot.start, displayTimeZone, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              setStep("service");
            }}
          >
            {t("Booking.back")}
          </Button>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        onFocus={() => {
          setArmed(true);
        }}
        noValidate
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

        {step === "details" ? (
          <div className="flex flex-col gap-4">
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
              {(field) => (
                <Textarea {...field} {...register("notes")} rows={3} />
              )}
            </FormField>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("slot");
                }}
              >
                {t("Booking.back")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void continueToReview();
                }}
              >
                {t("Booking.details.continue")}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "review" && service && mode && selectedSlot ? (
          <div className="flex flex-col gap-4">
            <p className="text-olive font-serif text-lg">
              {t("Booking.review.title")}
            </p>
            <dl className="text-charcoal/80 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
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
                {formatDateHeading(selectedSlot.start, displayTimeZone, locale)}
                {", "}
                {formatTime(selectedSlot.start, displayTimeZone, locale)}
                {" ("}
                {mode === "online"
                  ? Intl.DateTimeFormat().resolvedOptions().timeZone
                  : timezone}
                {")"}
              </dd>
              <dt className="font-medium">{t("Booking.review.duration")}</dt>
              <dd>
                {t("Booking.serviceCard.durationLabel", {
                  min: service.durationMin ?? 0,
                })}
              </dd>
              <dt className="font-medium">{t("Booking.review.price")}</dt>
              <dd>{formatPrice(service, locale)}</dd>
            </dl>

            <p className="text-charcoal/60 text-xs">
              {t("Booking.review.cancellationNote")}
            </p>

            <TurnstileWidget armed={armed} onVerify={setTurnstileToken} />

            {state === "error" ? (
              <p role="alert" className="text-sm text-red-700">
                {t("Booking.genericError")}
              </p>
            ) : null}
            {state === "rate_limited" ? (
              <p role="alert" className="text-sm text-red-700">
                {t("Booking.rateLimited")}
              </p>
            ) : null}
            {state === "slot_taken" ? (
              <p role="alert" className="text-sm text-red-700">
                {t("Booking.slotTaken")}
              </p>
            ) : null}
            {state === "invalid" ? (
              <p role="alert" className="text-sm text-red-700">
                {t("Booking.invalid")}
              </p>
            ) : null}
            {state === "service_unavailable" ? (
              <p role="alert" className="text-sm text-red-700">
                {t("Booking.serviceUnavailable")}
              </p>
            ) : null}

            <p className="text-charcoal/60 text-xs">
              {t("Booking.privacyNotice")}{" "}
              <Link href="/datenschutz" className="text-olive underline">
                {t("Booking.privacyLinkLabel")}
              </Link>
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("details");
                }}
              >
                {t("Booking.back")}
              </Button>
              <Button type="submit" disabled={isPending} className="self-start">
                {isPending
                  ? t("Booking.submitting")
                  : service.price
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
