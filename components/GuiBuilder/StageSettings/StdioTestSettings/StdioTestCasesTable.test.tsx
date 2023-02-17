import { TestCase, Valgrind } from "@/types/GuiBuilder";
import { mapTestCasesToTableData } from "./StdioTestCasesTable";

const testCases: TestCase[] = [
  {
    id: 1,
    file: "a.out",
    visibility: "ALWAYS_VISIBLE",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 1,
    _valgrindOverride: false,
  },
  {
    id: 2,
    file: "a.out",
    visibility: "ALWAYS_HIDDEN",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 2,
    _valgrindOverride: true,
    valgrind: {
      enabled: true,
      checksFilter: [],
      visibility: "ALWAYS_VISIBLE",
    },
  },
  {
    id: 3,
    file: "a.out",
    visibility: "VISIBLE_AFTER_GRADING",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 3,
    _valgrindOverride: true,
    valgrind: {
      enabled: false,
      checksFilter: [],
      visibility: "ALWAYS_VISIBLE",
    },
  },
];

describe("GuiBuilder: <StdioTestCasesTable />", () => {
  test("mapTestCasesToTableData()", () => {
    // No Valgrind in pipeline
    expect(mapTestCasesToTableData(testCases, null)).toEqual([
      {
        id: testCases[0].id,
        score: testCases[0].score,
        visibility: testCases[0].visibility,
        runValgrind: false, // Always false because the pipeline has no Valgrind stage
      },
      {
        id: testCases[1].id,
        score: testCases[1].score,
        visibility: testCases[1].visibility,
        runValgrind: false,
      },
      {
        id: testCases[2].id,
        score: testCases[2].score,
        visibility: testCases[2].visibility,
        runValgrind: false,
      },
    ]);

    // Valgrind in pipeline
    [true, false].forEach((enabled) => {
      const valgrind: Valgrind = {
        enabled,
        checksFilter: [],
        visibility: "ALWAYS_VISIBLE",
      };
      const tableData = mapTestCasesToTableData(testCases, valgrind);
      expect(tableData.map((t) => t.runValgrind)).toEqual([
        enabled, // Follows `valgrind.enabled`
        true, // Since the override enables it
        false, // Since the override disables it
      ]);
    });
  });
});
