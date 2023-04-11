/**
 * @file Utilities for manipulating dates.
 */

import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

/**
 * Appends a `"Z"` to the end of an ISO date string to indicate it's UTC time if it does not end with it.
 */
export function appendZToIsoString(isoString: string) {
  if (isoString.endsWith("Z")) {
    return isoString;
  }
  return isoString + "Z";
}

/**
 * Converts a Date object to an ISO date string in local UTC time.
 */
export function getDateStringFromLocalDate(date: Date | null) {
  return date ? zonedTimeToUtc(date, "Asia/Hong_Kong").toISOString() : null;
}

/**
 * Converts an ISO date string to a Date object in local time.
 */
export function getLocalDateFromString(date: string | null) {
  return date ? utcToZonedTime(appendZToIsoString(date), "Asia/Hong_Kong") : null;
}
