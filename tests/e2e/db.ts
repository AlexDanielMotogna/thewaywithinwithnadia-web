import pg from "pg";

// E2E bookings use Resend's test inbox (`delivered+<label>@resend.dev`):
// with real email enabled, Resend simulates a successful delivery instead
// of bouncing (bounces on a fake domain hurt the sending domain). The
// `e2e-` label lets every test booking be found and removed again.
const E2E_EMAIL_PREFIX = "delivered+e2e-";
const E2E_EMAIL_DOMAIN = "resend.dev";

export function e2eEmail(tag: string): string {
  return `${E2E_EMAIL_PREFIX}${tag}-${String(Date.now())}@${E2E_EMAIL_DOMAIN}`;
}

async function withClient<T>(run: (client: pg.Client) => Promise<T>) {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DIRECT_URL is not set");
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

export interface BookingRow {
  id: number;
  status: string;
  mode: string;
  locale: string;
  starts_at: Date;
  confirmation_sent_at: Date | null;
  owner_notified_at: Date | null;
  cancellation_sent_at: Date | null;
}

const COLUMNS =
  "id, status, mode, locale, starts_at, confirmation_sent_at, owner_notified_at, cancellation_sent_at";

/** All bookings for this address, oldest first. */
export function findBookingsByEmail(email: string): Promise<BookingRow[]> {
  return withClient(async (client) => {
    const result = await client.query<BookingRow>(
      `select ${COLUMNS} from bookings where client_email = $1 order by id`,
      [email],
    );
    return result.rows;
  });
}

export function findBookingById(id: number): Promise<BookingRow | null> {
  return withClient(async (client) => {
    const result = await client.query<BookingRow>(
      `select ${COLUMNS} from bookings where id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  });
}

export function deleteE2eBookings(): Promise<void> {
  return withClient(async (client) => {
    const pattern = `${E2E_EMAIL_PREFIX}%@${E2E_EMAIL_DOMAIN}`;
    // Their queued side-effect jobs first, so nothing runs for a booking
    // that no longer exists.
    await client.query(
      "delete from payload_jobs where (input->>'bookingId')::int in (select id from bookings where client_email like $1)",
      [pattern],
    );
    await client.query("delete from bookings where client_email like $1", [
      pattern,
    ]);
  });
}
