import * as migration_20261008_231508 from "./20261008_231508";
import * as migration_20261008_232140 from "./20261008_232140";
import * as migration_20261009_102001_phase2_optional_fields from "./20261009_102001_phase2_optional_fields";
import * as migration_20261009_110713_cta_background_image from "./20261009_110713_cta_background_image";
import * as migration_20261009_113315_mockup_design_fidelity from "./20261009_113315_mockup_design_fidelity";
import * as migration_20261009_170030_contact_messages from "./20261009_170030_contact_messages";
import * as migration_20261012_184209_booking_no_overlap from "./20261012_184209_booking_no_overlap";
import * as migration_20261012_192138_booking_jobs_queue from "./20261012_192138_booking_jobs_queue";
import * as migration_20261028_210018_remove_calendar_event_job from "./20261028_210018_remove_calendar_event_job";
import * as migration_20261028_214004_calendar_connection from "./20261028_214004_calendar_connection";
import * as migration_20261109_214926_booking_self_service from "./20261109_214926_booking_self_service";
import * as migration_20261109_233339_booking_page from "./20261109_233339_booking_page";
import * as migration_20261111_200113_site_redesign_blocks from "./20261111_200113_site_redesign_blocks";

export const migrations = [
  {
    up: migration_20261008_231508.up,
    down: migration_20261008_231508.down,
    name: "20261008_231508",
  },
  {
    up: migration_20261008_232140.up,
    down: migration_20261008_232140.down,
    name: "20261008_232140",
  },
  {
    up: migration_20261009_102001_phase2_optional_fields.up,
    down: migration_20261009_102001_phase2_optional_fields.down,
    name: "20261009_102001_phase2_optional_fields",
  },
  {
    up: migration_20261009_110713_cta_background_image.up,
    down: migration_20261009_110713_cta_background_image.down,
    name: "20261009_110713_cta_background_image",
  },
  {
    up: migration_20261009_113315_mockup_design_fidelity.up,
    down: migration_20261009_113315_mockup_design_fidelity.down,
    name: "20261009_113315_mockup_design_fidelity",
  },
  {
    up: migration_20261009_170030_contact_messages.up,
    down: migration_20261009_170030_contact_messages.down,
    name: "20261009_170030_contact_messages",
  },
  {
    up: migration_20261012_184209_booking_no_overlap.up,
    down: migration_20261012_184209_booking_no_overlap.down,
    name: "20261012_184209_booking_no_overlap",
  },
  {
    up: migration_20261012_192138_booking_jobs_queue.up,
    down: migration_20261012_192138_booking_jobs_queue.down,
    name: "20261012_192138_booking_jobs_queue",
  },
  {
    up: migration_20261028_210018_remove_calendar_event_job.up,
    down: migration_20261028_210018_remove_calendar_event_job.down,
    name: "20261028_210018_remove_calendar_event_job",
  },
  {
    up: migration_20261028_214004_calendar_connection.up,
    down: migration_20261028_214004_calendar_connection.down,
    name: "20261028_214004_calendar_connection",
  },
  {
    up: migration_20261109_214926_booking_self_service.up,
    down: migration_20261109_214926_booking_self_service.down,
    name: "20261109_214926_booking_self_service",
  },
  {
    up: migration_20261109_233339_booking_page.up,
    down: migration_20261109_233339_booking_page.down,
    name: "20261109_233339_booking_page",
  },
  {
    up: migration_20261111_200113_site_redesign_blocks.up,
    down: migration_20261111_200113_site_redesign_blocks.down,
    name: "20261111_200113_site_redesign_blocks",
  },
];
