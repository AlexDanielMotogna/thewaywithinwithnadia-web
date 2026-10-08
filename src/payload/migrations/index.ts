import * as migration_20261008_231508 from "./20261008_231508";
import * as migration_20261008_232140 from "./20261008_232140";

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
];
