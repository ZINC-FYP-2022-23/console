/**
 * @file Tests for conversion of raw stage configs with {@link SupportedStage.configFromRaw} and
 * {@link SupportedStage.configToRaw}.
 */

import supportedStages, { SupportedStage, valgrindDefaultConfig } from "@constants/Config/supportedStages";
import {
  Compile,
  CompileRaw,
  FileStructureValidation,
  Score,
  ScoreRaw,
  StageDataMap,
  StdioTest,
  StdioTestRaw,
  TestCase,
  TestCaseRaw,
  Valgrind,
  ValgrindRaw,
} from "@types";
import * as uuid from "uuid";
import { configsToConfigsRaw, parseStages } from "../stage";
import * as stageConfig from "../stageConfig";

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

describe("Raw stage configs conversion", () => {
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

      it("converts `additional_packages` to undefined if empty", () => {
        const stage = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          additional_packages: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.additional_packages).toBeUndefined();
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

      it("converts empty `ignore_in_submission` array to undefined", () => {
        const stage = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.ignore_in_submission).toBeUndefined();
      });
    });
  });

  describe("Score", () => {
    describe("configFromRaw", () => {
      it("converts all numerical fields to strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
      });

      it("converts all undefined fields to empty strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
      });
    });

    describe("configToRaw", () => {
      it("converts numerical strings to numbers", () => {
        const stage = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config).toEqual({
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
      });

      it("converts empty strings to undefined", () => {
        const stage = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config).toEqual({
          normalizedTo: 100,
          minScore: undefined,
          maxScore: undefined,
        });
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
        const testCaseFromRawMock = jest.spyOn(stageConfig, "testCaseFromRaw");
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
      it("converts a minimum raw test case appropriately", () => {
        const testCaseRaw: TestCaseRaw = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
        };
        const expected: TestCase = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          score: "",
          _stdinInputMode: "none",
          _expectedInputMode: "none",
          _valgrindOverride: false,
        };
        expect(stageConfig.testCaseFromRaw(testCaseRaw)).toEqual(expected);
      });

      it("converts different fields of raw test case appropriately", () => {
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
        const output = stageConfig.testCaseFromRaw(testCaseRaw);
        expect(output.score).toBe("5");
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
          score: "5",
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
        const testCaseToRawMock = jest.spyOn(stageConfig, "testCaseToRaw");
        const testCases: TestCase[] = [
          {
            id: 1,
            file: "a.out",
            visibility: "ALWAYS_VISIBLE",
            score: "5",
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
          score: "5",
          _stdinInputMode: "none",
          _expectedInputMode: "none",
          _valgrindOverride: false,
        };
        const output = stageConfig.testCaseToRaw(testCase);
        expect("_stdinInputMode" in output).toBe(false);
        expect("_expectedInputMode" in output).toBe(false);
        expect("_valgrindOverride" in output).toBe(false);
      });

      it("converts different fields of test case appropriately", () => {
        const testCase: TestCase = {
          id: 1,
          file: "a.out",
          visibility: "ALWAYS_VISIBLE",
          args: "   1   2 ",
          score: "5",
          stdin: "1 2 3",
          file_stdin: "stdin.txt",
          expected: "hello world",
          file_expected: "  expected.txt  ",
          _stdinInputMode: "none",
          _expectedInputMode: "file",
          _valgrindOverride: false,
        };
        const output = stageConfig.testCaseToRaw(testCase);
        expect(output.score).toBe(5);
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
      it("populates missing fields appropriately", () => {
        const stage = createRawStage<ValgrindRaw>("valgrind", {});
        expect(parseStages(stage)[1][UUID].config).toEqual(valgrindDefaultConfig);
      });

      it("converts `args` from string array to string", () => {
        const stage = createRawStage<ValgrindRaw>("valgrind", {
          args: ["--leak-check=full", "--show-leak-kinds=all"],
        });
        expect(parseStages(stage)[1][UUID].config.args).toBe("--leak-check=full --show-leak-kinds=all");
      });

      it("converts `score` from number to string", () => {
        const stage = createRawStage<ValgrindRaw>("valgrind", {
          score: 5,
        });
        expect(parseStages(stage)[1][UUID].config.score).toBe("5");
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

      it("converts `score` to number", () => {
        const stage = createStage<Valgrind>("Valgrind", {
          enabled: true,
          checksFilter: ["*"],
          visibility: "INHERIT",
          score: "5.5",
        });
        expect(configsToConfigsRaw(stage)[UUID].config.score).toBe(5.5);
      });
    });
  });

  describe("getTestCasesLargestId()", () => {
    it("returns 0 if there are no test cases", () => {
      expect(stageConfig.getTestCasesLargestId([])).toBe(0);
    });

    it("returns the largest test case ID if there are >1 test cases", () => {
      const commonField: Omit<TestCase, "id"> = {
        file: "a.out",
        visibility: "ALWAYS_VISIBLE",
        score: "5",
        _stdinInputMode: "none",
        _expectedInputMode: "none",
        _valgrindOverride: false,
      };
      const testCases: TestCase[] = [
        { id: 3, ...commonField },
        { id: 1, ...commonField },
        { id: 2, ...commonField },
      ];
      expect(stageConfig.getTestCasesLargestId(testCases)).toBe(3);
    });
  });
});
