"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  cancelManagedBookingAction,
  rescheduleManagedBookingAction,
  type ManageActionError,
  type SerializedSlot,
} from "@/modules/booking/actions";
import type { ManagedBooking } from "@/modules/booking/application/client-self-service";
import {
  displayTimeZoneFor,
  formatSlotDate,
  formatSlotTime,
  SlotCalendar,
} from "@/modules/booking/ui/slot-calendar";
import { Button } from "@/ui";

type View =
  | { kind: "overview" }
  | { kind: "confirm_cancel" }
  | { kind: "pick_slot"; slot: SerializedSlot | null }
  | { kind: "done"; outcome: "cancelled" | "rescheduled" };

export function ManageBooking({
  token,
  booking,
  locale,
}: {
  token: string;
  booking: ManagedBooking;
  locale: "en" | "de";
}) {
  const t = useTranslations();
  const [view, setView] = useState<View>({ kind: "overview" });
  const [error, setError] = useState<ManageActionError | null>(null);
  const [slotPickerKey, setSlotPickerKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const timeZone = displayTimeZoneFor(booking.mode, booking.timezone);
  const describe = (iso: string) =>
    `${formatSlotDate(iso, timeZone, locale)}, ${formatSlotTime(iso, timeZone, locale)}`;

  function handleFailure(failure: ManageActionError) {
    setError(failure);
    if (failure.kind === "slot_taken") {
      setSlotPickerKey((key) => key + 1);
      setView({ kind: "pick_slot", slot: null });
    }
  }

  function cancel() {
    startTransition(() => {
      void cancelManagedBookingAction({ token }).then((result) => {
        if (result.ok) setView({ kind: "done", outcome: "cancelled" });
        else handleFailure(result.error);
      });
    });
  }

  function reschedule(slot: SerializedSlot) {
    startTransition(() => {
      void rescheduleManagedBookingAction({
        token,
        newStartsAt: slot.start,
      }).then((result) => {
        if (result.ok) setView({ kind: "done", outcome: "rescheduled" });
        else handleFailure(result.error);
      });
    });
  }

  if (view.kind === "done") {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-olive-dark">
          {view.outcome === "cancelled"
            ? t("ManageBooking.cancelled")
            : t("ManageBooking.rescheduled")}
        </p>
        {view.outcome === "cancelled" ? (
          <Link href="/book" className="text-olive underline">
            {t("ManageBooking.bookAgain")}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <dl className="text-charcoal/80 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-medium">{t("Booking.review.service")}</dt>
        <dd>{booking.serviceName}</dd>
        <dt className="font-medium">{t("Booking.review.mode")}</dt>
        <dd>
          {booking.mode === "online"
            ? t("Booking.review.modeOnline")
            : t("Booking.review.modeInPerson")}
        </dd>
        <dt className="font-medium">{t("Booking.review.dateTime")}</dt>
        <dd>
          {describe(booking.startsAt)} (
          {timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone})
        </dd>
        <dt className="font-medium">{t("Booking.review.duration")}</dt>
        <dd>
          {t("Booking.serviceCard.durationLabel", { min: booking.durationMin })}
        </dd>
      </dl>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error.kind === "slot_taken"
            ? t("ManageBooking.slotTaken")
            : error.kind === "not_active"
              ? t("ManageBooking.notActive")
              : error.kind === "too_late"
                ? t("ManageBooking.tooLate", { hours: error.hours })
                : error.kind === "invalid_link"
                  ? t("ManageBooking.invalidLink")
                  : t("ManageBooking.genericError")}
        </p>
      ) : null}

      {view.kind === "overview" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setError(null);
              setView({ kind: "pick_slot", slot: null });
            }}
          >
            {t("ManageBooking.rescheduleButton")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setError(null);
              setView({ kind: "confirm_cancel" });
            }}
          >
            {t("ManageBooking.cancelButton")}
          </Button>
        </div>
      ) : null}

      {view.kind === "confirm_cancel" ? (
        <div className="flex flex-col gap-3">
          <p className="text-charcoal/80">
            {t("ManageBooking.confirmCancelQuestion")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending} onClick={cancel}>
              {isPending
                ? t("ManageBooking.working")
                : t("ManageBooking.confirmCancel")}
            </Button>
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setView({ kind: "overview" });
              }}
            >
              {t("ManageBooking.keep")}
            </Button>
          </div>
        </div>
      ) : null}

      {view.kind === "pick_slot" ? (
        <div className="flex flex-col gap-4">
          <p className="text-charcoal/80 text-sm">
            {t("ManageBooking.rescheduleIntro")}
          </p>
          <SlotCalendar
            key={slotPickerKey}
            serviceId={booking.serviceId}
            mode={booking.mode}
            locale={locale}
            selected={view.slot}
            onSelect={(slot) => {
              setError(null);
              setView({ kind: "pick_slot", slot });
            }}
          />
          <div className="flex flex-wrap gap-2">
            {view.slot ? (
              <Button
                disabled={isPending}
                onClick={() => {
                  if (view.slot) reschedule(view.slot);
                }}
              >
                {isPending
                  ? t("ManageBooking.working")
                  : t("ManageBooking.confirmReschedule", {
                      when: describe(view.slot.start),
                    })}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setView({ kind: "overview" });
              }}
            >
              {t("Booking.back")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
