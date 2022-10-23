import { Schedule } from "@types";
import { appendZToIsoString, isScheduleEqual } from "../schedule";

describe("Schedule utils", () => {
  describe("isScheduleEqual()", () => {
    it("returns true if two schedules are equal", () => {
      // s1 simulates a schedule object that comes from the Postgres database.
      // All timestamps are stored in UTC time, but the ISO strings do not end with a "Z" character.
      const s1: Schedule = {
        showAt: "2022-09-01T16:00:00",
        startCollectionAt: "2022-09-01T16:00:00",
        dueAt: "2022-09-10T16:00:00",
        stopCollectionAt: "2022-09-10T16:00:00",
        releaseGradeAt: "2022-09-10T16:00:00",
      };
      const s2: Schedule = {
        ...s1,
        // Simulates that we use Date Picker to pick the exact same time, but it returns
        // a slightly different ISO string (note the "Z" at the end)
        showAt: "2022-09-01T16:00:00.000Z",
      };

      expect(isScheduleEqual(s1, s2)).toBe(true);
    });
  });

  describe("appendZToIsoString()", () => {
    it("appends `Z` character at the end if it doesn't exist", () => {
      const isoString = "2022-09-01T16:00:00";
      expect(appendZToIsoString(isoString)).toBe("2022-09-01T16:00:00Z");
    });

    it("returns the same string if `Z` already exists at the end", () => {
      const isoString = "2022-09-01T16:00:00Z";
      expect(appendZToIsoString(isoString)).toBe(isoString);
    });
  });
});