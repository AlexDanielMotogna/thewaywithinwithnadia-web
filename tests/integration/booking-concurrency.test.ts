import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import type { Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Wednesday. 09:00 in Europe/Vienna (CEST) is 07:00 UTC.
const SLOT = "2099-06-03T07:00:00.000Z";
const RACERS = 8;

type CreateBookingRow =
  typeof import("@/modules/booking/infrastructure/create-booking-row").createBookingRow;
type WriteValidatedBooking =
  typeof import("@/modules/booking/application/write-validated-booking").writeValidatedBooking;

// Payload types `migrate({ migrations })` as `(args: unknown) => ...`, while
// generated migrations (and its own `prodMigrations` option) take
// MigrateUpArgs. Method-syntax parameters are checked bivariantly, so this
// type bridges the two without a cast.
interface RunnableMigration {
  name: string;
  up(args: unknown): Promise<void>;
  down(args: unknown): Promise<void>;
}

let container: StartedPostgreSqlContainer;
let payload: Payload;
let writeValidatedBooking: WriteValidatedBooking;
let createBookingRow: CreateBookingRow;
let serviceId: number;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:17-alpine").start();
  // payload.config.ts reads these when it is first imported, so set them
  // before any dynamic import below. No S3 vars: media falls back to disk.
  process.env.DATABASE_URL = container.getConnectionUri();
  process.env.PAYLOAD_SECRET = "integration-test-secret";

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  // On every non-production start Payload regenerates payload-types.ts,
  // here from a config without S3 (drops Media._objectKey). The committed
  // file comes from `pnpm payload:generate-types`; keep the test off it.
  const resolvedConfig = await config;
  resolvedConfig.typescript.autoGenerate = false;
  payload = await getPayload({ config: resolvedConfig });
  // Same migrations as production, including the hand-written exclusion
  // constraint (ENGINEERING.md §5.3). Passed in already imported: Payload's
  // own loader uses Node's native import(), which can't load the .ts files.
  const { migrations } = await import("@/payload/migrations");
  const runnable: RunnableMigration[] = migrations;
  await payload.db.migrate({ migrations: runnable });

  ({ writeValidatedBooking } =
    await import("@/modules/booking/application/write-validated-booking"));
  ({ createBookingRow } =
    await import("@/modules/booking/infrastructure/create-booking-row"));

  const service = await payload.create({
    collection: "services",
    data: {
      name: "Integration test session",
      slug: "integration-test-session",
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
});

afterAll(async () => {
  await payload.destroy();
  // destroy() leaves the pg pool open, and Payload keeps one client checked
  // out for its whole life (reconnect detection), so pool.end() would never
  // resolve. Instead, handle the "terminating connection" error each idle
  // client emits when the container stops; Payload's held client already
  // has its own error listener.
  if (hasPgPool(payload.db)) {
    payload.db.pool.on("error", () => undefined);
  }
  await container.stop();
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

function bookingRequest(startsAt: string, n: number) {
  return {
    serviceId,
    startsAt,
    mode: "online",
    locale: "en",
    clientName: `Racer ${String(n)}`,
    clientEmail: `racer${String(n)}@test.invalid`,
  };
}

describe("booking double-booking guarantee (real Postgres)", () => {
  it(`lets exactly one of ${String(RACERS)} concurrent requests for the same slot win`, async () => {
    const results = await Promise.all(
      Array.from({ length: RACERS }, (_, n) =>
        writeValidatedBooking(bookingRequest(SLOT, n)),
      ),
    );

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    for (const r of results.filter((r) => !r.ok)) {
      expect(r).toEqual({ ok: false, error: { kind: "slot_taken" } });
    }
    const stored = await payload.find({
      collection: "bookings",
      where: { startsAt: { equals: SLOT } },
    });
    expect(stored.totalDocs).toBe(1);
  });

  it("rejects an overlap at the database level even when the pre-check is skipped", async () => {
    // 30 min into the 60 min booking above, written straight to the row
    // writer: what a concurrent request that passed the pre-check does.
    const result = await createBookingRow({
      clientName: "Overlap",
      clientEmail: "overlap@test.invalid",
      clientPhone: null,
      serviceId,
      startsAt: new Date("2099-06-03T07:30:00.000Z"),
      durationMin: 60,
      bufferMin: 15,
      mode: "online",
      locale: "en",
      notes: null,
      priceAmount: 80,
      currency: "EUR",
    });
    expect(result).toEqual({ ok: false, error: { kind: "slot_taken" } });
  });

  it("frees the slot once the booking is cancelled", async () => {
    const [taken] = (
      await payload.find({
        collection: "bookings",
        where: { startsAt: { equals: SLOT } },
      })
    ).docs;
    if (!taken) throw new Error("expected the winning booking");
    await payload.update({
      collection: "bookings",
      id: taken.id,
      data: { status: "cancelled" },
    });

    const again = await writeValidatedBooking(bookingRequest(SLOT, 100));
    expect(again.ok).toBe(true);
  });
});
