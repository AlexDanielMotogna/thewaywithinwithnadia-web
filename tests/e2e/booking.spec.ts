import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { signToken } from "../../src/lib/signed-token";
import {
  deleteE2eBookings,
  e2eEmail,
  findBookingById,
  findBookingsByEmail,
  type BookingRow,
} from "./db";

// Runs against the real database with the booking test data in place
// (bookable services + availability rules). Every booking it creates uses
// a Resend test address (see db.ts) and is deleted afterwards.

// Side effects run in Payload's job queue, every minute.
const JOB_TIMEOUT_MS = 150_000;

test.afterAll(async () => {
  await deleteE2eBookings();
});

/** The link from the confirmation email, built the same way the app does. */
function manageUrl(booking: BookingRow, locale: "en" | "de"): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error("PAYLOAD_SECRET is not set");
  const token = signToken({
    data: String(booking.id),
    secret,
    purpose: "booking-manage",
    expiresAt: new Date(booking.starts_at),
  });
  return `/${locale}/book/manage?token=${encodeURIComponent(token)}`;
}

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

async function waitFor<T>(
  read: () => Promise<T>,
  done: (value: T) => boolean,
): Promise<T> {
  let value = await read();
  const deadline = Date.now() + JOB_TIMEOUT_MS;
  while (!done(value) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    value = await read();
  }
  return value;
}

/** Picks a free time in the month calendar: the n-th day with times, its first time. */
async function pickTime(page: Page, dayIndex = 0) {
  await page
    .getByRole("button", { name: /times available|zeiten verfügbar/i })
    .nth(dayIndex)
    .click();
  await page
    .getByRole("group", { name: /available times|freie zeiten/i })
    .getByRole("button")
    .first()
    .click();
}

async function bookFirstSlot(
  page: Page,
  input: {
    path: string;
    mode?: RegExp;
    email: string;
    continueLabel: RegExp;
    confirmLabel: RegExp;
    success: RegExp;
  },
) {
  await page.goto(input.path);
  if (input.mode) await page.getByRole("radio", { name: input.mode }).check();
  await pickTime(page);
  await page.getByRole("textbox", { name: /^name/i }).fill("E2E Test Client");
  await page.getByRole("textbox", { name: /^e-?mail/i }).fill(input.email);
  await page.getByRole("button", { name: input.continueLabel }).click();
  await page.getByRole("button", { name: input.confirmLabel }).click();
  await expect(page.getByText(input.success)).toBeVisible();
}

test("the booking index links to each service's booking page", async ({
  page,
}) => {
  await page.goto("/en/book");
  await expectNoSeriousA11yViolations(page);
  await page.getByRole("link", { name: /meditation/i }).click();
  await expect(page).toHaveURL(/\/en\/book\/meditation$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Meditation" }),
  ).toBeVisible();
});

test("in-person: book, get confirmed, reschedule and cancel via the email link", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Full flow runs once");
  test.setTimeout(6 * 60_000);
  const email = e2eEmail("in-person");

  await page.goto("/en/book/1-1-personal-guidance");
  await expectNoSeriousA11yViolations(page);

  await bookFirstSlot(page, {
    path: "/en/book/1-1-personal-guidance",
    email,
    continueLabel: /continue to review/i,
    confirmLabel: /confirm booking|obligation to pay/i,
    success: /your session is booked/i,
  });

  const [created] = await findBookingsByEmail(email);
  if (!created) throw new Error("booking was not stored");
  expect(created.status).toBe("confirmed");
  expect(created.mode).toBe("in_person");
  expect(created.locale).toBe("en");

  // The job sends the confirmation email (and Nadia's notice, when an
  // address is set in Site Settings).
  const confirmed = await waitFor(
    () => findBookingById(created.id),
    (row) => Boolean(row?.confirmation_sent_at && row.owner_notified_at),
  );
  expect(confirmed?.confirmation_sent_at).toBeTruthy();
  expect(confirmed?.owner_notified_at).toBeTruthy();

  // Reschedule through the link.
  await page.goto(manageUrl(created, "en"));
  await expectNoSeriousA11yViolations(page);
  await page.getByRole("button", { name: "Choose another time" }).click();
  // Take a slot on a later day than the current one.
  await pickTime(page, 1);
  await page.getByRole("button", { name: /move my session to/i }).click();
  await expect(page.getByText(/your session has been moved/i)).toBeVisible();

  const afterMove = await findBookingsByEmail(email);
  expect(afterMove.map((b) => b.status)).toEqual(["rescheduled", "confirmed"]);
  const moved = afterMove[1];
  if (!moved) throw new Error("rescheduled booking missing");
  expect(moved.locale).toBe("en");

  // The old link is spent.
  await page.goto(manageUrl(created, "en"));
  await expect(
    page.getByText(/already been cancelled or moved/i),
  ).toBeVisible();

  // Cancel the new booking through its own link.
  await page.goto(manageUrl(moved, "en"));
  await page.getByRole("button", { name: "Cancel session" }).click();
  await page.getByRole("button", { name: "Yes, cancel it" }).click();
  await expect(
    page.getByText(/your session has been cancelled/i),
  ).toBeVisible();
  expect((await findBookingById(moved.id))?.status).toBe("cancelled");

  // The cancellation email goes out (via the job queue).
  const notified = await waitFor(
    () => findBookingById(moved.id),
    (row) => Boolean(row?.cancellation_sent_at),
  );
  expect(notified?.cancellation_sent_at).toBeTruthy();
});

test("online booking in German", async ({ page }) => {
  const email = e2eEmail("online-de");

  await bookFirstSlot(page, {
    path: "/de/book/meditation",
    mode: /online-sitzung/i,
    email,
    continueLabel: /weiter zur prüfung/i,
    confirmLabel: /buchung bestätigen|zahlungspflichtig buchen/i,
    success: /ihr termin ist gebucht/i,
  });

  const [created] = await findBookingsByEmail(email);
  expect(created?.status).toBe("confirmed");
  expect(created?.mode).toBe("online");
  expect(created?.locale).toBe("de");
});

test("a tampered manage link is refused", async ({ page }) => {
  await page.goto("/en/book/manage?token=not-a-real-token");
  await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "contact me" })).toBeVisible();
});
