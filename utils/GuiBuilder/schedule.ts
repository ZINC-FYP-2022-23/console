import { Schedule } from "@/types/GuiBuilder";
import { isEqual } from "date-fns";
import { appendZToIsoString } from "../date";

/**
 * Compares if two {@link Schedule} objects are equal.
 */
export function isScheduleEqual(s1: Schedule, s2: Schedule) {
  let equal = true;
  for (const [key, value] of Object.entries(s1) as [keyof Schedule, string | null][]) {
    const s1DateStr = value;
    const s2DateStr = s2[key];

    if (s1DateStr === null && s2DateStr === null) continue;
    if ((s1DateStr === null && s2DateStr !== null) || (s1DateStr !== null && s2DateStr === null)) {
      equal = false;
      break;
    }

    // `value` or `s2[key]` is an ISO string that possibly comes from the Postgres database. Although
    // ZINC's Postgres database stores all timestamps in UTC, the ISO string that's actually stored
    // does not end with a `Z` character (which indicates UTC). Hence, we append `Z` at the end of the
    // input ISO string to facilitate date comparison.
    const s1Date = new Date(appendZToIsoString(s1DateStr!));
    const s2Date = new Date(appendZToIsoString(s2DateStr!));
    if (!isEqual(s1Date, s2Date)) {
      equal = false;
      break;
    }
  }
  return equal;
}
