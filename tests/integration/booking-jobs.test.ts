import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import type { Payload } from "payload";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { User } from "@/payload-types";

vi.mock("server-only", () => ({}));

// The Bookings hooks queue the calendar/email jobs for every path: the
// website's use cases and direct admin edits (ENGINEERING.md §5.5). Jobs are
// only queued here, never run: the test Payload starts without the cron.

type WriteValidatedBooking =
  typeof import("@/modules/booking/application/write-validated-booking").writeValidatedBooking;

// See booking-concurrency.test.ts: bridges Payload's migrate() typing.
interface RunnableMigration {
  name: string;
  up(args: unknown): Promise<void>;
  down(args: unknown): Promise<void>;
}

let container: StartedPostgreSqlContainer;
let payload: Payload;
let writeValidatedBooking: WriteValidatedBooking;
let serviceId: number;
let owner: User;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:17-alpine").start();
  process.env.DATABASE_URL = container.getConnectionUri();
  process.env.PAYLOAD_SECRET = "integration-test-secret";

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const resolvedConfig = await config;
  resolvedConfig.typescript.autoGenerate = false;
  payload = await getPayload({ config: resolvedConfig });
  const { migrations } = await import("@/payload/migrations");
  const runnable: RunnableMigration[] = migrations;
  await payload.db.migrate({ migrations: runnable });

  ({ writeValidatedBooking } =
    await import("@/modules/booking/application/write-validated-booking"));

  const service = await payload.create({
    collection: "services",
    data: {
      name: "Jobs test session",
      slug: "jobs-test-session",
      durationMin: 60,
      price: 80,
      currency: "EUR",
      mode: "both",
      active: true,
      bookingEnabled: true,
    },
  });
  serviceId = service.id;
  await payload.create({
    collection: "availability-rules",
    data: { weekday: "wed", startTime: "09:00", endTime: "17:00" },
  });
  owner = await payload.create({
    collection: "users",
    data: {
      email: "nadia@test.invalid",
      password: "integration-test-password",
      role: "admin",
    },
  });
});

afterAll(async () => {
  await payload.destroy();
  if (hasPgPool(payload.db)) {
    payload.db.pool.on("error", () => undefined);
  }
  await container.stop();
});

beforeEach(async () => {
  await payload.delete({
    collection: "payload-jobs",
    where: { id: { exists: true } },
  });
});

function hasPgPool(
  db: object,
): db is { pool: { on(event: "error", listener: () => void): unknown } } {
  return (
    "pool" in db &&
    typeof db.pool === "object" &&
    db.pool !== null &&
    "on" in db.pool &&
    typeof db.pool.on === "function"
  );
}

async function queuedJobs() {
  const { docs } = await payload.find({
    collection: "payload-jobs",
    sort: "createdAt",
    limit: 50,
  });
  return docs.map((job) => ({ task: job.taskSlug, input: job.input }));
}

// Distinct Wednesdays, so bookings never overlap each other.
async function adminBooking(startsAt: string, calendarEventId?: string) {
  const booking = await payload.create({
    collection: "bookings",
    user: owner,
    data: {
      clientName: "Phone client",
      clientEmail: "phone@test.invalid",
      service: serviceId,
      startsAt,
      durationMin: 60,
      bufferMin: 15,
      mode: "in_person",
      locale: "en",
      status: "confirmed",
      currency: "EUR",
    },
  });
  if (calendarEventId === undefined) return booking;
  // What processBookingSideEffects stores once the event exists.
  return payload.update({
    collection: "bookings",
    id: booking.id,
    data: { calendarEventId },
  });
}

describe("Bookings hooks queue the side-effect jobs (real Postgres)", () => {
  it("queues the calendar/email job exactly once for a website booking", async () => {
    const result = await writeValidatedBooking({
      serviceId,
      startsAt: "2099-06-03T07:00:00.000Z",
      mode: "online",
      locale: "en",
      clientName: "Web client",
      clientEmail: "web@test.invalid",
    });
    if (!result.ok) throw new Error("expected the booking to succeed");

    expect(await queuedJobs()).toEqual([
      {
        task: "processBookingSideEffects",
        input: { bookingId: result.value.bookingId, notifyOwner: true },
      },
    ]);
  });

  it("queues the calendar/email job for a booking created in the admin, without notifying Nadia", async () => {
    const booking = await adminBooking("2099-06-10T07:00:00.000Z");

    expect(await queuedJobs()).toEqual([
      {
        task: "processBookingSideEffects",
        input: { bookingId: booking.id, notifyOwner: false },
      },
    ]);
  });

  it("keeps the calendar event when Nadia marks a session completed", async () => {
    const booking = await adminBooking("2099-06-17T07:00:00.000Z", "evt-done");
    await payload.delete({
      collection: "payload-jobs",
      where: { id: { exists: true } },
    });

    await payload.update({
      collection: "bookings",
      id: booking.id,
      user: owner,
      data: { status: "completed" },
    });

    expect(await queuedJobs()).toEqual([]);
  });

  it("removes the event and emails the client when Nadia cancels", async () => {
    const booking = await adminBooking(
      "2099-06-24T07:00:00.000Z",
      "evt-cancel",
    );
    await payload.delete({
      collection: "payload-jobs",
      where: { id: { exists: true } },
    });

    await payload.update({
      collection: "bookings",
      id: booking.id,
      user: owner,
      data: { status: "cancelled" },
    });

    expect(await queuedJobs()).toEqual([
      {
        task: "removeBookingCalendarEvent",
        input: { bookingId: booking.id, calendarEventId: "evt-cancel" },
      },
      {
        task: "notifyBookingCancelled",
        input: { bookingId: booking.id, notifyOwner: false },
      },
    ]);
  });

  it("removes the event of a booking deleted in the admin", async () => {
    const booking = await adminBooking(
      "2099-07-01T07:00:00.000Z",
      "evt-deleted",
    );
    await payload.delete({
      collection: "payload-jobs",
      where: { id: { exists: true } },
    });

    await payload.delete({
      collection: "bookings",
      id: booking.id,
      user: owner,
    });

    expect(await queuedJobs()).toEqual([
      {
        task: "removeBookingCalendarEvent",
        input: { bookingId: booking.id, calendarEventId: "evt-deleted" },
      },
    ]);
  });
});
