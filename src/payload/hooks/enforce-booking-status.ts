import { ValidationError, type CollectionBeforeChangeHook } from "payload";
import {
  BOOKING_USE_CASE_CONTEXT,
  checkStatusChange,
  type StatusChangeError,
} from "@/modules/booking/pure";
import type { Booking } from "@/payload-types";

function describe(error: StatusChangeError): string {
  switch (error.kind) {
    case "invalid_transition":
      return `A booking cannot go from "${error.from}" to "${error.to}".`;
    case "invalid_initial_status":
      return `A new booking must start as "pending" or "confirmed", not "${error.to}".`;
    case "use_case_required":
      return `"${error.to}" cannot be set by hand. Use the reschedule action, which also creates the new booking.`;
    default: {
      const unhandled: never = error;
      return String(unhandled);
    }
  }
}

/**
 * ENGINEERING.md §5.4: every status change goes through the state machine,
 * including edits made directly in the admin.
 */
export const enforceBookingStatus: CollectionBeforeChangeHook<Booking> = ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const to = data.status;
  if (to === undefined) return data;

  const from = operation === "create" ? null : (originalDoc?.status ?? null);
  if (from === to) return data;

  const result = checkStatusChange({
    from,
    to,
    viaUseCase: req.context[BOOKING_USE_CASE_CONTEXT] === true,
  });
  if (!result.ok) {
    throw new ValidationError({
      collection: "bookings",
      errors: [{ path: "status", message: describe(result.error) }],
      req,
    });
  }
  return data;
};
