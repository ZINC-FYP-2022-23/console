/**
 * @file Tests for conversion of raw stage configs with {@link SupportedStage.configFromRaw} and
 * {@link SupportedStage.configToRaw}.
 */

/// <reference types="jest-extended" />
import {
  defaultScoreWeightingXUnit,
  defaultTotalScorableScore,
  defaultValgrindConfig,
} from "@/constants/GuiBuilder/defaults";
import supportedStages, { SupportedStage } from "@/constants/GuiBuilder/supportedStages";
import {
  Compile,
  CompileRaw,
  FileStructureValidation,
  Make,
  MakeRaw,
  PyTest,
  PyTestRaw,
  StageDataMap,
  StdioTest,
  StdioTestRaw,
  TestCase,
  TestCaseRaw,
  Valgrind,
  ValgrindRaw,
} from "@/types";
import "jest-extended";
import * as uuid from "uuid";
import { configsToConfigsRaw, parseStages } from "../stage";
import * as stageRawConfig from "../stageRawConfig";

const UUID = "mock-uuid-1";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue(UUID);

const createRawStage = <T>(key: string, config: T) => ({
  [key]: config,
});

const createStage = <T>(name: string, config: T): StageDataMap => ({
  [UUID]: {
    name,
    label: "",
    kind: supportedStages[name].kind,
    config,
  },
});

describe("GuiBuilder: Raw stage configs conversion", () => {
  describe("Compile", () => {
    describe("configFromRaw", () => {
      it("converts `flags` array to a string", () => {
        const stage = createRawStage<CompileRaw>("compile", {
          input: ["*.cpp"],
          flags: ["-Wall", "-Wextra", "-g"],
        });
        expect(parseStages(stage)[1][UUID].config.flags).toBe("-Wall -Wextra -g");
      });

      it("converts `additional_packages` to empty array if undefined", () => {
        const stage = createRawStage<CompileRaw>("compile", {
          input: ["*.cpp"],
        });
        expect(parseStages(stage)[1][UUID].config.additional_packages).toEqual([]);
      });
    });

    describe("configToRaw", () => {
      it("trims the string in `output`", () => {
        const stage = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          output: "  a.out  ",
          additional_packages: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.output).toBe("a.out");
      });

      it("converts `flags` to string array", () => {
        const stage = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          flags: "  -Wall -Wextra   -g   ",
          additional_packages: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.flags).toEqual(["-Wall", "-Wextra", "-g"]);
      });
    });
  });

  describe("FileStructureValidation", () => {
    describe("configToRaw", () => {
      it("trims and removes empty strings in `ignore_in_submission`", () => {
        const stage = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: ["  a.txt", "", "b.txt  "],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.ignore_in_submission).toEqual(["a.txt", "b.txt"]);
      });
    });
  });

  describe("Make", () => {
    describe("configFromRaw", () => {
      it("converts nullable arrays to empty arrays", () => {
        const stage = createRawStage<MakeRaw>("make", {});
        const config = parseStages(stage)[1][UUID].config;
        expect(config.targets).toEqual([]);
        expect(config.additional_packages).toEqual([]);
      });

      it("converts `args` array to a string", () => {
        const stage = createRawStage<MakeRaw>("make", {
          args: ["-f", "Makefile"],
        });
        expect(parseStages(stage)[1][UUID].config.args).toBe("-f Makefile");
      });
    });

    describe("configToRaw", () => {
      it("converts `args` to string array", () => {
        const stage = createStage<Make>("Make", {
          targets: [],
          args: "  -f Makefile  ",
          additional_packages: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.args).toEqual(["-f", "Makefile"]);
      });
    });
  });

  describe("PyTest", () => {
    describe("configFromRaw", () => {
      it("converts `args` array to a string", () => {
        const stage = createRawStage<PyTestRaw>("pyTest", {
          args: ["--version", "-h"],
        });
        expect(parseStages(stage)[1][UUID].config.args).toBe("--version -h");
      });

      it("populates missing fields", () => {
        const stage = createRawStage<PyTestRaw>("pyTest", {});
        expect(parseStages(stage)[1][UUID].config).toStrictEqual({
          args: "",
          additional_pip_packages: [],
          _scorePolicy: "disable",
          score: defaultTotalScorableScore,
          scoreWeighting: defaultScoreWeightingXUnit,
        });
      });

      it("initializes the helper `_scorePolicy` field", () => {
        // Total-Based policy
        const stageTotal = createRawStage<PyTestRaw>("pyTest", { score: 20 });
        const configTotal = parseStages(stageTotal)[1][UUID].config as PyTest;
        expect(configTotal._scorePolicy).toBe("total");
        expect(configTotal.score).toBe(20);

        // Weighted policy
        const stageWeighted = createRawStage<PyTestRaw>("pyTest", {
          scoreWeighting: { default: 2 },
        });
        const configWeighted = parseStages(stageWeighted)[1][UUID].config as PyTest;
        expect(configWeighted._scorePolicy).toBe("weighted");
        expect(configWeighted.scoreWeighting).toStrictEqual({
          default: 2,
          overrides: [],
        });
      });

      it("generates UUID for each override in `scoreWeighting`", () => {
        jest
          .spyOn(uuid, "v4")
          .mockReturnValueOnce(UUID) // PyTest stage's UUID in `parseStages()`
          .mockReturnValueOnce("mock-uuid-2") // UUID of 1st override
          .mockReturnValueOnce("mock-uuid-3"); // UUID of 2nd override

        const stage = createRawStage<PyTestRaw>("pyTest", {
          scoreWeighting: {
            default: 1,
            overrides: [
              { score: 2, className: { op: "EQ", value: "Foo" } },
              { score: 3, className: { op: "EQ", value: "Bar" } },
            ],
          },
        });
        const config = parseStages(stage)[1][UUID].config as PyTest;
        expect(config.scoreWeighting.overrides).toStrictEqual([
          { _uuid: "mock-uuid-2", score: 2, className: { op: "EQ", value: "Foo" } },
          { _uuid: "mock-uuid-3", score: 3, className: { op: "EQ", value: "Bar" } },
        ]);
      });
    });

    describe("configToRaw", () => {
      // TODO(Anson): Instead of using this PyTest-specific helper function, refactor `createStage()`
      // so it directly returns a raw config.
      const createConvertedPyTestStage = (_scorePolicy: PyTest["_scorePolicy"]) => {
        const stage = createStage<PyTest>("PyTest", {
          args: "  --version -h  ",
          additional_pip_packages: [],
          _scorePolicy,
          score: 20,
          treatDenormalScore: "FAILURE",
          scoreWeighting: {
            default: 1,
            overrides: [
              { _uuid: "mock-uuid-2", score: 2, className: { op: "EQ", value: "Foo" } },
              { _uuid: "mock-uuid-3", score: 3, className: { op: "EQ", value: "Bar" } },
            ],
          },
        });
        const _stage = configsToConfigsRaw(stage);
        return _stage[UUID].config as PyTestRaw;
      };

      it("converts `args` to string array", () => {
        const configRaw = createConvertedPyTestStage("total");
        expect(configRaw.args).toEqual(["--version", "-h"]);
      });

      it("discards score-related fields according to `_scorePolicy`", () => {
        // Total-Based policy
        const configRawTotal = createConvertedPyTestStage("total");
        expect(configRawTotal).toContainAllKeys(["args", "additional_pip_packages", "score", "treatDenormalScore"]);
        expect(configRawTotal.score).toBe(20);
        expect(configRawTotal.treatDenormalScore).toBe("FAILURE");

        // Weighted policy
        const configRawWeighted = createConvertedPyTestStage("weighted");
        expect(configRawWeighted).toContainAllKeys(["args", "additional_pip_packages", "scoreWeighting"]);
        expect(configRawWeighted.scoreWeighting).toStrictEqual({
          default: 1,
          overrides: [
            { score: 2, className: { op: "EQ", value: "Foo" } },
            { score: 3, className: { op: "EQ", value: "Bar" } },
          ],
        });

        // Disable
        const configRawDisable = createConvertedPyTestStage("disable");
        expect(configRawDisable).toContainAllKeys(["args", "additional_pip_packages"]);
      });
    });
  });

  describe("StdioTest", () => {
    describe("configFromRaw", () => {
      it("converts nullable arrays to empty arrays", () => {
        const stage = createRawStage<StdioTestRaw>("stdioTest", {
          testCases: [],
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          testCases: [],
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
        });
      });

      it("calls testCaseFromRaw() on each test case", () => {
        const testCaseFromRawMock = jest.spyOn(stageRawConfig, "testCaseFromRaw");
        const testCases: TestCaseRaw[] = [
          { id: 1, file: "a.out", visibility: "ALWAYS_VISIBLE" },
          { id: 2, file: "b.out", visibility: "ALWAYS_HIDDEN" },
        ];
        const stage = createRawStage<StdioTestRaw>("stdioTest", { testCases });
        parseStages(stage);
        expect(testCaseFromRawMock).toHaveBeenNthCalledWith(1, testCases[0]);
        expect(testCaseFromRawMock).toHaveBeenNthCalledWith(2, testCases[1]);
      });

      it("sorts `testCases` in ascending order of ID", () => {
        const testCases: TestCaseRaw[] = [
          { id: 2, file: "b.out", visibility: "ALWAYS_HIDDEN" },
          { id: 1, file: "a.out", visibility: "ALWAYS_VISIBLE" },
        ];
        const stage = createRawStage<StdioTestRaw>("stdioTest", { testCases });
        const outputTestCases = (parseStages(stage)[1][UUID].config as StdioTest).testCases;
        expect(outputTestCases[0].id).toBe(1);
        expect(outputTestCases[1].id).toBe(2);
      });
    });

    describe("testCaseFromRaw()", () => {
      it("converts a minimum raw test case", () => {
        const testCaseRaw: TestCaseRaw = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
        };
        const expected: TestCase = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          _stdinInputMode: "none",
          _expectedInputMode: "none",
          _valgrindOverride: false,
        };
        expect(stageRawConfig.testCaseFromRaw(testCaseRaw)).toEqual(expected);
      });

      it("converts different fields of raw test case", () => {
        const testCaseRaw: TestCaseRaw = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          args: ["1", "2"],
          score: 5,
          file_stdin: "stdin.txt",
          expected: "hello world",
          valgrind: { score: 10 },
        };
        const output = stageRawConfig.testCaseFromRaw(testCaseRaw);
        expect(output.args).toBe("1 2");
        expect(output._stdinInputMode).toBe("file");
        expect(output._expectedInputMode).toBe("text");
        expect(output._valgrindOverride).toBe(true);
      });
    });

    describe("configToRaw", () => {
      it("sorts `testCases` in ascending order of ID", () => {
        const commonField: Omit<TestCase, "id"> = {
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          score: 5,
          _stdinInputMode: "none",
          _expectedInputMode: "none",
          _valgrindOverride: false,
        };
        const stage = createStage<StdioTest>("StdioTest", {
          testCases: [
            { id: 3, ...commonField },
            { id: 2, ...commonField },
            { id: 1, ...commonField },
          ],
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
        });
        const _stage = configsToConfigsRaw(stage);
        const outputTestCaseIds = _stage[UUID].config.testCases.map((testCase: TestCaseRaw) => testCase.id);
        expect(outputTestCaseIds).toEqual([1, 2, 3]);
      });

      it("calls testCaseToRaw() on each test case", () => {
        const testCaseToRawMock = jest.spyOn(stageRawConfig, "testCaseToRaw");
        const testCases: TestCase[] = [
          {
            id: 1,
            file: "a.out",
            visibility: "ALWAYS_VISIBLE",
            score: 5,
            _stdinInputMode: "none",
            _expectedInputMode: "none",
            _valgrindOverride: false,
          },
        ];
        const stage = createStage<StdioTest>("StdioTest", {
          testCases,
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
        });
        configsToConfigsRaw(stage);
        expect(testCaseToRawMock).toHaveBeenCalledTimes(1);
        expect(testCaseToRawMock).toHaveBeenNthCalledWith(1, testCases[0]);
      });
    });

    describe("testCaseToRaw()", () => {
      it("removes helper fields from the test case", () => {
        const testCase: TestCase = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          score: 5,
          _stdinInputMode: "none",
          _expectedInputMode: "none",
          _valgrindOverride: false,
        };
        const output = stageRawConfig.testCaseToRaw(testCase);
        expect("_stdinInputMode" in output).toBe(false);
        expect("_expectedInputMode" in output).toBe(false);
        expect("_valgrindOverride" in output).toBe(false);
      });

      it("converts different fields of test case", () => {
        const testCase: TestCase = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          args: "   1   2 ",
          score: 5,
          stdin: "1 2 3",
          file_stdin: "stdin.txt",
          expected: "hello world",
          file_expected: "  expected.txt  ",
          _stdinInputMode: "none",
          _expectedInputMode: "file",
          _valgrindOverride: false,
        };
        const output = stageRawConfig.testCaseToRaw(testCase);
        expect(output.args).toEqual(["1", "2"]);
        expect(output.stdin).toBeUndefined(); // Since _stdinInputMode is "none"
        expect(output.file_stdin).toBeUndefined();
        expect(output.expected).toBeUndefined(); // Since _expectedInputMode is "file"
        expect(output.file_expected).toBe("expected.txt");
      });
    });
  });

  describe("Valgrind", () => {
    describe("valgrindFromRaw()", () => {
      it("populates missing fields", () => {
        const stage = createRawStage<ValgrindRaw>("valgrind", {});
        expect(parseStages(stage)[1][UUID].config).toEqual(defaultValgrindConfig);
      });

      it("converts `args` from string array to string", () => {
        const stage = createRawStage<ValgrindRaw>("valgrind", {
          args: ["--leak-check=full", "--show-leak-kinds=all"],
        });
        expect(parseStages(stage)[1][UUID].config.args).toBe("--leak-check=full --show-leak-kinds=all");
      });
    });

    describe("valgrindToRaw()", () => {
      it("converts `args` to string array", () => {
        const stage = createStage<Valgrind>("Valgrind", {
          enabled: true,
          checksFilter: ["*"],
          visibility: "INHERIT",
          args: "  --leak-check=full    --show-leak-kinds=all    ",
        });
        expect(configsToConfigsRaw(stage)[UUID].config.args).toEqual(["--leak-check=full", "--show-leak-kinds=all"]);
      });
    });
  });
});
