// Key the booking module sets in Payload's `req.context` on its own writes,
// so the Bookings `beforeChange` guard can tell a use case from a direct
// edit in the admin. No `server-only`: the guard runs inside payload.config.
export const BOOKING_USE_CASE_CONTEXT = "bookingUseCase";
