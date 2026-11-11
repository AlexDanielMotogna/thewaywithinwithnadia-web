"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import {
  getAvailableSlotsAction,
  type SerializedSlot,
} from "@/modules/booking/actions";
import { cn } from "@/lib/cn";
import { Icon } from "@/ui";

export type SlotMode = "online" | "in_person";

const DAY_MS = 86_400_000;
const MAX_MONTHS_AHEAD = 12;

// ---- date helpers (calendar dates as "YYYY-MM-DD", arithmetic in UTC so
// DST never shifts a day) ----

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function keyOfUtc(date: Date): string {
  return `${String(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function utcOfKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

/** Calendar day of an instant in a timezone (`undefined` = the browser's). */
export function dayKeyOf(iso: string, timeZone: string | undefined): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatSlotDate(
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

export function formatSlotTime(
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

/**
 * Online sessions are shown in the visitor's own timezone, in-person ones
 * in the business timezone (ENGINEERING.md §5.1). `undefined` = browser.
 */
export function displayTimeZoneFor(
  mode: SlotMode,
  businessTimeZone: string,
): string | undefined {
  return mode === "online" ? undefined : businessTimeZone || undefined;
}

// "Today" from the browser. Read through useSyncExternalStore so the
// server (and the prerendered HTML) sees `null` and never bakes a date in
// (Cache Components, BUGS.md); the browser fills it in on hydration.
const noSubscription = () => () => undefined;
function browserToday(): string {
  const now = new Date();
  return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
function useToday(): string | null {
  return useSyncExternalStore(noSubscription, browserToday, () => null);
}

interface MonthGrid {
  monthKey: string; // "YYYY-MM"
  firstOfMonth: Date;
  cells: { key: string; inMonth: boolean }[];
}

function monthGrid(today: string, offset: number): MonthGrid {
  const t = utcOfKey(today);
  const firstOfMonth = new Date(
    Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + offset, 1),
  );
  const monthKey = keyOfUtc(firstOfMonth).slice(0, 7);
  // Weeks start on Monday (European calendars).
  const lead = (firstOfMonth.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth() + 1, 0),
  ).getUTCDate();
  // Whole weeks only: leading days of the previous month, trailing days of
  // the next one.
  const cellCount = Math.ceil((lead + daysInMonth) / 7) * 7;
  const start = new Date(firstOfMonth.getTime() - lead * DAY_MS);
  const cells = Array.from({ length: cellCount }, (_, i) => {
    const key = keyOfUtc(new Date(start.getTime() + i * DAY_MS));
    return { key, inMonth: key.startsWith(monthKey) };
  });
  return { monthKey, firstOfMonth, cells };
}

function weekdayNames(locale: string): { short: string; long: string }[] {
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.UTC(2024, 0, 1 + i));
    return {
      short: new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }).format(date),
      long: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        timeZone: "UTC",
      }).format(date),
    };
  });
}

interface Loaded {
  requestKey: string;
  slots: SerializedSlot[];
  timezone: string;
}

/**
 * Month calendar (days with free times carry a dot) plus the list of free
 * times for the chosen day. The grid is a real ARIA grid of buttons with
 * arrow-key support and `aria-selected`; times are plain buttons
 * (LEGAL.md §3.2: keyboard-operable, no drag, timezone stated in text).
 */
export function SlotCalendar({
  serviceId,
  mode,
  locale,
  selected,
  onSelect,
  onTimezone,
}: {
  serviceId: number;
  mode: SlotMode;
  locale: string;
  selected: SerializedSlot | null;
  onSelect: (slot: SerializedSlot) => void;
  onTimezone?: (timezone: string) => void;
}) {
  const t = useTranslations("Booking");
  const today = useToday();
  const [monthOffset, setMonthOffset] = useState(0);
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());
  const focusDayAfterRender = useRef(false);

  const grid = useMemo(
    () => (today ? monthGrid(today, monthOffset) : null),
    [today, monthOffset],
  );
  const requestKey = grid ? `${String(serviceId)}:${grid.monthKey}` : null;

  useEffect(() => {
    if (!grid || !requestKey) return undefined;
    let cancelled = false;
    const first = grid.cells[0];
    const last = grid.cells[grid.cells.length - 1];
    if (!first || !last) return undefined;
    // One day of margin either side covers any timezone offset.
    const from = new Date(utcOfKey(first.key).getTime() - DAY_MS);
    const to = new Date(utcOfKey(last.key).getTime() + 2 * DAY_MS);

    void getAvailableSlotsAction({
      serviceId,
      from: from.toISOString(),
      to: to.toISOString(),
    }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setLoaded({
          requestKey,
          slots: result.value.slots,
          timezone: result.value.timezone,
        });
        onTimezone?.(result.value.timezone);
      } else {
        setLoaded({ requestKey, slots: [], timezone: "" });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [grid, requestKey, serviceId, onTimezone]);

  const current = loaded?.requestKey === requestKey ? loaded : null;
  const displayTimeZone = displayTimeZoneFor(mode, current?.timezone ?? "");

  const slotsByDay = useMemo(() => {
    const map = new Map<string, SerializedSlot[]>();
    for (const slot of current?.slots ?? []) {
      const key = dayKeyOf(slot.start, displayTimeZone);
      const list = map.get(key);
      if (list) list.push(slot);
      else map.set(key, [slot]);
    }
    return map;
  }, [current, displayTimeZone]);

  const availableDays = useMemo(
    () =>
      (grid?.cells ?? [])
        .filter((cell) => cell.inMonth && slotsByDay.has(cell.key))
        .map((cell) => cell.key),
    [grid, slotsByDay],
  );

  // The selected slot's day wins, then the visitor's click, then the first
  // day with free times.
  const selectedDay = selected
    ? dayKeyOf(selected.start, displayTimeZone)
    : null;
  const activeDay =
    [chosenDay, selectedDay].find(
      (day): day is string => day !== null && availableDays.includes(day),
    ) ??
    availableDays[0] ??
    null;

  useEffect(() => {
    if (!focusDayAfterRender.current || !activeDay) return;
    focusDayAfterRender.current = false;
    dayButtons.current.get(activeDay)?.focus();
  }, [activeDay]);

  function moveMonth(delta: number) {
    setChosenDay(null);
    setMonthOffset((offset) =>
      Math.min(MAX_MONTHS_AHEAD, Math.max(0, offset + delta)),
    );
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (!activeDay) return;
    const step = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const from = utcOfKey(activeDay).getTime();
    // Nearest available day in the pressed direction.
    const candidates = availableDays.filter((day) =>
      step > 0
        ? utcOfKey(day).getTime() > from
        : utcOfKey(day).getTime() < from,
    );
    const target =
      Math.abs(step) === 1
        ? step > 0
          ? candidates[0]
          : candidates[candidates.length - 1]
        : candidates
            .map((day) => ({
              day,
              distance: Math.abs(
                Math.abs(utcOfKey(day).getTime() - from) / DAY_MS - 7,
              ),
            }))
            .sort((a, b) => a.distance - b.distance)[0]?.day;
    if (target) {
      focusDayAfterRender.current = true;
      setChosenDay(target);
    }
  }

  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
  const monthLabel = grid
    ? new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(grid.firstOfMonth)
    : "";
  const longDate = (key: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(utcOfKey(key));

  const daySlots = activeDay ? (slotsByDay.get(activeDay) ?? []) : [];
  const monthLabelId = `calendar-month-${String(serviceId)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="border-sand-dark rounded-md border bg-white/60 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                moveMonth(-1);
              }}
              disabled={monthOffset === 0}
              aria-label={t("calendar.previousMonth")}
              className="text-olive hover:bg-sand flex size-11 items-center justify-center rounded-full disabled:opacity-30"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <p
              id={monthLabelId}
              aria-live="polite"
              className="text-olive font-serif text-lg capitalize"
            >
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => {
                moveMonth(1);
              }}
              disabled={monthOffset >= MAX_MONTHS_AHEAD}
              aria-label={t("calendar.nextMonth")}
              className="text-olive hover:bg-sand flex size-11 items-center justify-center rounded-full disabled:opacity-30"
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>

          <table
            role="grid"
            aria-labelledby={monthLabelId}
            onKeyDown={onGridKeyDown}
            className="w-full table-fixed border-collapse text-center text-sm"
          >
            <thead>
              <tr>
                {weekdays.map((day) => (
                  <th
                    key={day.long}
                    scope="col"
                    abbr={day.long}
                    className="text-charcoal/70 pb-2 text-xs font-normal capitalize"
                  >
                    {day.short.replace(".", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(
                { length: (grid?.cells.length ?? 0) / 7 },
                (_, row) => (
                  <tr key={row}>
                    {grid?.cells.slice(row * 7, row * 7 + 7).map((cell) => {
                      const day = Number(cell.key.slice(8));
                      const available =
                        cell.inMonth && slotsByDay.has(cell.key);
                      const isActive = cell.key === activeDay;
                      return (
                        <td
                          key={cell.key}
                          role="gridcell"
                          aria-selected={available ? isActive : undefined}
                          className="p-0.5"
                        >
                          {available ? (
                            <button
                              type="button"
                              ref={(node) => {
                                if (node)
                                  dayButtons.current.set(cell.key, node);
                                else dayButtons.current.delete(cell.key);
                              }}
                              tabIndex={isActive ? 0 : -1}
                              aria-label={t("calendar.dayAvailable", {
                                date: longDate(cell.key),
                              })}
                              onClick={() => {
                                setChosenDay(cell.key);
                              }}
                              className={cn(
                                "duration-fast relative mx-auto flex size-10 flex-col items-center justify-center rounded-full transition-colors",
                                isActive
                                  ? "bg-olive text-ivory"
                                  : "text-olive hover:bg-sand font-medium",
                              )}
                            >
                              {day}
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "absolute bottom-1 size-1 rounded-full",
                                  isActive ? "bg-ivory" : "bg-olive",
                                )}
                              />
                            </button>
                          ) : cell.inMonth ? (
                            <span className="text-charcoal/70 mx-auto flex size-10 items-center justify-center">
                              {day}
                            </span>
                          ) : (
                            // Days of the neighbouring months stay empty: a
                            // faded number would fail text contrast (WCAG
                            // 1.4.3) and they cannot be picked anyway.
                            <span className="mx-auto block size-10" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-olive font-serif text-base">
            {t("calendar.availableTimes")}
          </p>
          <div aria-live="polite">
            {!current ? (
              <p className="text-charcoal/70 text-sm">
                {t("slotPicker.loading")}
              </p>
            ) : availableDays.length === 0 ? (
              <p className="text-charcoal/70 text-sm">
                {t("calendar.noTimesThisMonth")}
              </p>
            ) : (
              <div
                role="group"
                aria-label={
                  activeDay
                    ? `${t("calendar.availableTimes")}: ${longDate(activeDay)}`
                    : t("calendar.availableTimes")
                }
                className="grid grid-cols-3 gap-2 sm:grid-cols-2"
              >
                {daySlots.map((slot) => {
                  const isSelected = selected?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        onSelect(slot);
                      }}
                      className={cn(
                        "duration-fast min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-olive border-olive text-ivory"
                          : "border-sand-dark text-olive hover:border-olive bg-white/60",
                      )}
                    >
                      {formatSlotTime(slot.start, displayTimeZone, locale)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {current?.timezone ? (
        <p className="text-charcoal/70 flex items-center gap-2 text-xs">
          <Icon name="clock" size={14} aria-hidden="true" />
          {mode === "online"
            ? t("slotPicker.timezoneLabelOnline", {
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })
            : t("slotPicker.timezoneLabelInPerson", { tz: current.timezone })}
        </p>
      ) : null}
    </div>
  );
}
