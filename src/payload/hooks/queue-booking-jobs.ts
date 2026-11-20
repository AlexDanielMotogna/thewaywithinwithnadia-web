import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";
import {
  jobsForBookingChange,
  type BookingChange,
  type BookingJob,
} from "@/modules/booking/pure";
import type { Booking } from "@/payload-types";

/**
 * Queues the side-effect jobs of every booking write, whichever path made
 * it: the website's use cases or Nadia in the admin (ENGINEERING.md §5.5).
 * Queued with `req`, so the jobs only exist if the write itself commits.
 * Which jobs to queue is decided by the pure `jobsForBookingChange`.
 */
async function queueJobs(
  change: BookingChange,
  doc: Booking,
  req: PayloadRequest,
): Promise<void> {
  const jobs = jobsForBookingChange({
    change,
    status: doc.status,
    hasCalendarEvent: Boolean(doc.calendarEventId),
    byOwner: Boolean(req.user),
  });
  for (const job of jobs) {
    await queueJob(job, doc, req);
  }
}

async function queueJob(
  job: BookingJob,
  doc: Booking,
  req: PayloadRequest,
): Promise<void> {
  switch (job.task) {
    case "processBookingSideEffects":
      await req.payload.jobs.queue({
        task: job.task,
        input: { bookingId: doc.id, notifyOwner: job.notifyOwner },
        req,
      });
      return;
    case "removeBookingCalendarEvent":
      // The event ID travels with the job: after a delete the booking row
      // is gone and the job could not look it up any more.
      await req.payload.jobs.queue({
        task: job.task,
        input: {
          bookingId: doc.id,
          calendarEventId: doc.calendarEventId ?? null,
        },
        req,
      });
      return;
    case "notifyBookingCancelled":
      await req.payload.jobs.queue({
        task: job.task,
        input: { bookingId: doc.id, notifyOwner: job.notifyOwner },
        req,
      });
      return;
    default: {
      const unhandled: never = job;
      throw new Error(`Unhandled booking job ${String(unhandled)}`);
    }
  }
}

export const queueBookingJobsAfterChange: CollectionAfterChangeHook<
  Booking
> = async ({ doc, previousDoc, operation, req }) => {
  const change: BookingChange =
    operation === "create"
      ? { kind: "created" }
      : { kind: "updated", from: previousDoc.status };
  await queueJobs(change, doc, req);
  return doc;
};

export const queueBookingJobsAfterDelete: CollectionAfterDeleteHook<
  Booking
> = async ({ doc, req }) => {
  await queueJobs({ kind: "deleted" }, doc, req);
  return doc;
};
