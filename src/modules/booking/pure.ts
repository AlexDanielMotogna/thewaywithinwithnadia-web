// Second public entry point of the booking module, next to index.ts. Only
// pure domain code: no `server-only`, no React, no Payload. Payload
// collection hooks import from here because payload.config.ts is also
// loaded by the Payload CLI in plain Node, where index.ts (which re-exports
// `server-only` code and client components) cannot be imported.
export {
  checkStatusChange,
  isActiveBooking,
  type BookingStatus,
  type StatusChangeError,
} from "@/modules/booking/domain/state-machine";
export { BOOKING_USE_CASE_CONTEXT } from "@/modules/booking/infrastructure/use-case-context";
