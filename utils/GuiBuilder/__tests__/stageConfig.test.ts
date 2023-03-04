import { TestCase } from "@/types/GuiBuilder";
import { getTestCaseExpectedOutputHash, getTestCaseNeighborIds, getTestCasesLargestId } from "../stageConfig";
import { testCaseFromRaw } from "../stageRawConfig";

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

  test("getTestCaseExpectedOutputHash()", () => {
    const testCase1 = testCaseFromRaw({
      id: 1,
      visibility: "ALWAYS_VISIBLE",
      file: "a.out",
      args: ["1"],
    });
    const testCase2 = testCaseFromRaw({
      id: 4,
      visibility: "ALWAYS_VISIBLE",
      file: "a.out",
      args: ["20"],
    });

    // Expected hashes are obtained from running the Grader with the above test cases
    const testCase1Hash = "df49ad34bc881b548cef693e4baef84b9c6afccbe3cda7ef3832355f32abd5e8-1";
    const testCase2Hash = "d22478dfc4dbad7059ff87e4175d501e6f1c269fbcb4907cb83dfe8ad3346a71-4";

    expect(getTestCaseExpectedOutputHash(testCase1)).toBe(testCase1Hash);
    expect(getTestCaseExpectedOutputHash(testCase2)).toBe(testCase2Hash);
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
