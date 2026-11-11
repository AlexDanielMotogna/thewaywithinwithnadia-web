import "server-only";
import { getMailer } from "@/integrations/email/container";
import {
  clientCancellationEmail,
  ownerCancellationEmail,
} from "@/modules/booking/application/booking-emails";
import { loadBookingEmailFacts } from "@/modules/booking/application/booking-email-facts";
import {
  adminBookingUrl,
  bookUrl,
} from "@/modules/booking/application/booking-links";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getOwnerEmail } from "@/modules/booking/infrastructure/get-owner-email";
import { markCancellationSent } from "@/modules/booking/infrastructure/update-booking-side-effects";

/**
 * Job queued by the Bookings `afterChange` hook once a booking becomes
 * `cancelled`, from any path. Idempotent through `cancellationSentAt`, set
 * once every email went out. The client is always told, even when the
 * booking was cancelled before its own confirmation went out (e.g. moved
 * and then cancelled within a minute): they saw it happen on screen.
 */
export async function notifyBookingCancelled(input: {
  bookingId: number;
  notifyOwner: boolean;
}): Promise<void> {
  const booking = await getBookingById(input.bookingId);
  if (booking?.status !== "cancelled") return;
  if (booking.cancellationSentAt) return;

  const settings = await getBookingSettings();
  const facts = await loadBookingEmailFacts(booking, settings.timezone);
  const ownerEmail = await getOwnerEmail();
  const mailer = getMailer();

  // Nadia's notice first, the client's last: a failure throws before the
  // client email, so a retry can repeat Nadia's notice but never the
  // client's.
  if (input.notifyOwner && ownerEmail) {
    const sent = await mailer.send(
      ownerCancellationEmail({
        facts,
        ownerEmail,
        adminUrl: adminBookingUrl(booking.id),
      }),
    );
    if (!sent.ok) {
      throw new Error(
        `Booking ${String(booking.id)}: owner cancellation email failed`,
        { cause: sent.error },
      );
    }
  }

  const sent = await mailer.send(
    clientCancellationEmail({
      facts,
      bookUrl: bookUrl(booking.locale),
      ownerEmail,
    }),
  );
  if (!sent.ok) {
    throw new Error(
      `Booking ${String(booking.id)}: client cancellation email failed`,
      { cause: sent.error },
    );
  }

  await markCancellationSent(booking.id, new Date());
}
