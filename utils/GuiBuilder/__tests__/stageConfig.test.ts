import { TestCase } from "@types";
import { getTestCasesLargestId } from "../stageConfig";

describe("Stage config utils", () => {
  describe("getTestCasesLargestId()", () => {
    it("returns 0 if there are no test cases", () => {
      expect(getTestCasesLargestId([])).toBe(0);
    });

    it("returns the largest test case ID if there are >1 test cases", () => {
      const commonField: Omit<TestCase, "id"> = {
        file: "a.out",
        visibility: "ALWAYS_VISIBLE",
        score: 5,
        _stdinInputMode: "none",
        _expectedInputMode: "none",
        _valgrindOverride: false,
      };
      const testCases: TestCase[] = [
        { id: 3, ...commonField },
        { id: 1, ...commonField },
        { id: 2, ...commonField },
      ];
      expect(getTestCasesLargestId(testCases)).toBe(3);
    });
  });
});
