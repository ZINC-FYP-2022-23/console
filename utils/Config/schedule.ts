import { Schedule } from "@types";
import { isEqual } from "date-fns";

/**
 * Compares if two {@link Schedule} objects are equal.
 */
export function isScheduleEqual(s1: Schedule, s2: Schedule) {
  let equal = true;
  for (const [key, value] of Object.entries(s1)) {
    // `value` or `s2[key]` is an ISO string that possibly comes from the Postgres database. Although
    // ZINC's Postgres database stores all timestamps in UTC, the ISO string that's actually stored
    // does not end with a `Z` character (which indicates UTC). Hence, we append `Z` at the end of the
    // input ISO string to facilitate date comparison.
    const s1Date = new Date(appendZToIsoString(value));
    const s2Date = new Date(appendZToIsoString(s2[key]));
    if (!isEqual(s1Date, s2Date)) {
      equal = false;
      break;
    }
  }
  return equal;
}

/**
 * Appends a `"Z"` to the end of an ISO date string to indicate it's UTC time if it does not end with it.
 */
export function appendZToIsoString(isoString: string) {
  if (isoString.endsWith("Z")) {
    return isoString;
  }
  return isoString + "Z";
}