import { TestCase } from "@/types";
import { getTestCaseNeighborIds, getTestCasesLargestId } from "../stageConfig";

/**
 * @returns A dummy {@link TestCase} with the given `id`.
 */
const getTestCase = (id: number): TestCase => ({
  id,
  file: "a.out",
  visibility: "ALWAYS_VISIBLE",
  score: 5,
  _stdinInputMode: "none",
  _expectedInputMode: "none",
  _valgrindOverride: false,
});

/**
 * @returns An array of dummy test cases.
 * @param ids The IDs of the test cases.
 */
const getTestCases = (ids: number[]): TestCase[] => ids.map(getTestCase);

describe("GuiBuilder: Utils - Stage Config", () => {
  test("getTestCasesLargestId()", () => {
    // 0 test cases
    expect(getTestCasesLargestId([])).toBe(0);

    // >1 test cases
    const testCases = getTestCases([3, 1, 2]);
    expect(getTestCasesLargestId(testCases)).toBe(3);
  });

  test("getTestCaseNeighborIds()", () => {
    const testCases = getTestCases([2, 1, 5, 4]);

    expect(getTestCaseNeighborIds(testCases, 1)).toEqual([null, 2]);
    expect(getTestCaseNeighborIds(testCases, 2)).toEqual([1, 4]);
    expect(getTestCaseNeighborIds(testCases, 4)).toEqual([2, 5]);
    expect(getTestCaseNeighborIds(testCases, 5)).toEqual([4, null]);

    // Invalid ID
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
    expect(getTestCaseNeighborIds(testCases, 999)).toEqual([null, null]);
    consoleErrorMock.mockRestore();
  });
});
