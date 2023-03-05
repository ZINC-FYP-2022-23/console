/**
 * @file Tests for conversion of raw stage configs with {@link SupportedStage.configFromRaw} and
 * {@link SupportedStage.configToRaw}.
 */

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
  ScoreWeighting,
  ScoreWeightingRaw,
  ShellExec,
  ShellExecRaw,
  StdioTest,
  StdioTestRaw,
  TestCase,
  TestCaseRaw,
  Valgrind,
  ValgrindRaw,
  XUnitOverride,
  XUnitOverrideRaw,
} from "@/types/GuiBuilder";
import "jest-extended";
import * as uuid from "uuid";
import { configsToConfigsRaw, parseStages } from "../stage";
import * as stageRawConfig from "../stageRawConfig";

const UUID = "mock-uuid-0";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue(UUID);

/**
 * @param key Stage key you expect to find in a config YAML (e.g. `"stdioTest"`).
 * @param configRaw The raw stage config object.
 * @returns A parsed and tidied stage config object.
 */
const parseConfigFromRaw = <TRaw, TConfig = TRaw>(key: string, configRaw: TRaw) => {
  const rawStage = { [key]: configRaw };
  const [, stageData] = parseStages(rawStage);
  return stageData[UUID].config as TConfig;
};

/**
 * @param name Stage name (e.g. `"StdioTest"`)
 * @param config The tidied stage config object to be converted back to raw.
 * @returns A raw stage config object.
 */
const convertConfigToRaw = <TConfig, TRaw = TConfig>(name: string, config: TConfig) => {
  const stageDataTidied = configsToConfigsRaw({
    [UUID]: {
      name,
      label: "",
      kind: supportedStages[name].kind,
      config,
    },
  });
  return stageDataTidied[UUID].config as TRaw;
};

describe("GuiBuilder: Raw stage configs conversion", () => {
  describe("Compile", () => {
    test("configFromRaw", () => {
      const config = parseConfigFromRaw<CompileRaw, Compile>("compile", {
        input: ["*.cpp"],
        output: "a.out",
        flags: ["-Wall", "-Wextra", "-g"],
      });
      expect(config).toStrictEqual({
        input: ["*.cpp"],
        output: "a.out",
        flags: "-Wall -Wextra -g", // Convert to string
        additional_packages: [], // Populate missing
      });
    });

    test("configToRaw", () => {
      const configRaw = convertConfigToRaw<Compile, CompileRaw>("Compile", {
        input: ["*.cpp"],
        output: "  a.out  ",
        flags: "  -Wall -Wextra   -g   ",
        additional_packages: [],
      });
      expect(configRaw).toStrictEqual({
        input: ["*.cpp"],
        output: "a.out", // Trim string
        flags: ["-Wall", "-Wextra", "-g"], // Convert to array
        additional_packages: [],
      });
    });
  });

  describe("FileStructureValidation", () => {
    test("configToRaw", () => {
      const configRaw = convertConfigToRaw<FileStructureValidation>("FileStructureValidation", {
        ignore_in_submission: ["  a.txt", "", "b.txt  "],
      });
      expect(configRaw).toStrictEqual({
        ignore_in_submission: ["a.txt", "b.txt"], // Trim and remove empty strings
      });
    });
  });

  describe("Make", () => {
    test("configFromRaw", () => {
      // Test populate missing fields
      const configEmpty = parseConfigFromRaw<MakeRaw, Make>("make", {});
      expect(configEmpty).toStrictEqual(supportedStages.Make.defaultConfig);

      // Test conversion of populated fields
      const configWithData = parseConfigFromRaw<MakeRaw, Make>("make", {
        targets: ["all"],
        args: ["-f", "Makefile"],
        additional_packages: [],
      });
      expect(configWithData).toStrictEqual({
        targets: ["all"],
        args: "-f Makefile", // Convert to string
        additional_packages: [],
      });
    });

    test("configToRaw", () => {
      const configRaw = convertConfigToRaw<Make, MakeRaw>("Make", {
        targets: ["all"],
        args: "  -f Makefile  ",
        additional_packages: [],
      });
      expect(configRaw).toStrictEqual({
        targets: ["all"],
        args: ["-f", "Makefile"], // Convert to array
        additional_packages: [],
      });
    });
  });

  describe("PyTest", () => {
    describe("configFromRaw", () => {
      it("converts `args` array to a string", () => {
        const config = parseConfigFromRaw<PyTestRaw, PyTest>("pyTest", {
          args: ["--version", "-h"],
        });
        expect(config.args).toBe("--version -h");
      });

      it("populates missing fields", () => {
        const config = parseConfigFromRaw<PyTestRaw, PyTest>("pyTest", {});
        expect(config).toStrictEqual({
          args: "",
          additional_pip_packages: [],
          _scorePolicy: "disable",
          score: defaultTotalScorableScore,
          scoreWeighting: defaultScoreWeightingXUnit,
        });
      });

      it("initializes score-related fields", () => {
        // Total-Based policy
        const configTotal = parseConfigFromRaw<PyTestRaw, PyTest>("pyTest", { score: 20 });
        expect(configTotal._scorePolicy).toBe("total");
        expect(configTotal.score).toBe(20);

        // Weighted policy
        const swFromRawMock = jest.spyOn(stageRawConfig, "scoreWeightingFromRaw");
        const scoreWeighting: ScoreWeightingRaw<XUnitOverrideRaw> = {
          default: 2,
          overrides: [{ score: 1, className: { op: "EQ", value: "Bar" } }],
        };
        const configWeighted = parseConfigFromRaw<PyTestRaw, PyTest>("pyTest", { scoreWeighting });
        expect(configWeighted._scorePolicy).toBe("weighted");
        expect(swFromRawMock).toHaveBeenCalledWith(scoreWeighting);
      });
    });

    test("configToRaw", () => {
      const scoreWeighting: ScoreWeighting<XUnitOverride> = {
        default: 1,
        overrides: [
          { _uuid: "mock-uuid-1", score: 2, className: { op: "EQ", value: "Foo" } },
          { _uuid: "mock-uuid-2", score: 3, className: { op: "EQ", value: "Bar" } },
        ],
      };

      const convertPyTestConfigToRaw = (_scorePolicy: PyTest["_scorePolicy"]) =>
        convertConfigToRaw<PyTest, PyTestRaw>("PyTest", {
          args: "  --version -h  ",
          additional_pip_packages: [],
          _scorePolicy,
          score: 20,
          treatDenormalScore: "FAILURE",
          scoreWeighting,
        });

      // Total-Based policy
      const configRawTotal = convertPyTestConfigToRaw("total");
      expect(configRawTotal).toStrictEqual({
        args: ["--version", "-h"],
        additional_pip_packages: [],
        score: 20,
        treatDenormalScore: "FAILURE",
      });

      // Weighted policy
      const swToRawMock = jest.spyOn(stageRawConfig, "scoreWeightingToRaw");
      const configRawWeighted = convertPyTestConfigToRaw("weighted");
      expect(configRawWeighted).toContainAllKeys(["args", "additional_pip_packages", "scoreWeighting"]);
      expect(swToRawMock).toHaveBeenCalledWith(scoreWeighting);

      // Disable
      const configRawDisable = convertPyTestConfigToRaw("disable");
      expect(configRawDisable).toStrictEqual({
        args: ["--version", "-h"],
        additional_pip_packages: [],
      });
    });
  });

  describe("ShellExec", () => {
    test("configFromRaw", () => {
      const config = parseConfigFromRaw<ShellExecRaw, ShellExec>("shellExec", {
        cmd: "echo hello",
      });
      expect(config).toStrictEqual({
        cmd: "echo hello",
        additional_packages: [], // Populate missing
      });
    });
  });

  describe("StdioTest", () => {
    describe("configFromRaw", () => {
      it("populates missing fields", () => {
        const config = parseConfigFromRaw<StdioTestRaw, StdioTest>("stdioTest", {
          testCases: [],
        });
        expect(config).toStrictEqual(supportedStages.StdioTest.defaultConfig);
      });

      it("calls testCaseFromRaw() on each test case", () => {
        const testCaseFromRawMock = jest.spyOn(stageRawConfig, "testCaseFromRaw");
        const testCases: TestCaseRaw[] = [
          { id: 1, file: "a.out", visibility: "ALWAYS_VISIBLE" },
          { id: 2, file: "b.out", visibility: "ALWAYS_HIDDEN" },
        ];
        parseConfigFromRaw<StdioTestRaw, StdioTest>("stdioTest", { testCases });
        expect(testCaseFromRawMock).toHaveBeenNthCalledWith(1, testCases[0]);
        expect(testCaseFromRawMock).toHaveBeenNthCalledWith(2, testCases[1]);
      });

      it("sorts `testCases` in ascending order of ID", () => {
        const config = parseConfigFromRaw<StdioTestRaw, StdioTest>("stdioTest", {
          testCases: [
            { id: 2, file: "b.out", visibility: "ALWAYS_HIDDEN" },
            { id: 1, file: "a.out", visibility: "ALWAYS_VISIBLE" },
          ],
        });
        expect(config.testCases[0].id).toBe(1);
        expect(config.testCases[1].id).toBe(2);
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
        const configRaw = convertConfigToRaw<StdioTest, StdioTestRaw>("StdioTest", {
          testCases: [
            { id: 3, ...commonField },
            { id: 2, ...commonField },
            { id: 1, ...commonField },
          ],
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
        });
        const outputTestCaseIds = configRaw.testCases.map((testCase: TestCaseRaw) => testCase.id);
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
        convertConfigToRaw<StdioTest, StdioTestRaw>("StdioTest", {
          testCases,
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
        });
        expect(testCaseToRawMock).toHaveBeenCalledTimes(1);
        expect(testCaseToRawMock).toHaveBeenNthCalledWith(1, testCases[0]);
      });
    });
  });

  describe("Valgrind", () => {
    test("configFromRaw/valgrindFromRaw()", () => {
      // Test populate missing fields
      const configEmpty = parseConfigFromRaw<ValgrindRaw, Valgrind>("valgrind", {});
      expect(configEmpty).toEqual(defaultValgrindConfig);

      // Test conversion of populated fields
      const configWithData = parseConfigFromRaw<ValgrindRaw, Valgrind>("valgrind", {
        enabled: true,
        args: ["--leak-check=full", "--show-leak-kinds=all"],
        checksFilter: ["*"],
        visibility: "ALWAYS_HIDDEN",
        score: 10,
      });
      expect(configWithData).toStrictEqual({
        enabled: true,
        args: "--leak-check=full --show-leak-kinds=all", // Convert to string
        checksFilter: ["*"],
        visibility: "ALWAYS_HIDDEN",
        score: 10,
      });
    });

    test("configToRaw/valgrindToRaw()", () => {
      const configRaw = convertConfigToRaw<Valgrind, ValgrindRaw>("Valgrind", {
        enabled: true,
        args: "  --leak-check=full    --show-leak-kinds=all    ",
        checksFilter: ["*"],
        visibility: "ALWAYS_HIDDEN",
        score: 10,
      });
      expect(configRaw).toStrictEqual({
        enabled: true,
        args: ["--leak-check=full", "--show-leak-kinds=all"], // Convert to array
        checksFilter: ["*"],
        visibility: "ALWAYS_HIDDEN",
        score: 10,
      });
    });
  });

  describe("Utility: testCaseFromRaw()", () => {
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

  describe("Utility: scoreWeightingFromRaw()", () => {
    it("generates UUID for each element in `override` array", () => {
      jest.spyOn(uuid, "v4").mockReturnValueOnce("mock-uuid-1").mockReturnValueOnce("mock-uuid-2");
      const scRaw: ScoreWeightingRaw<XUnitOverrideRaw> = {
        default: 1,
        overrides: [
          { score: 2, className: { op: "EQ", value: "Foo" } },
          { score: 3, className: { op: "EQ", value: "Bar" } },
        ],
      };
      const sc = stageRawConfig.scoreWeightingFromRaw(scRaw);
      expect(sc).toStrictEqual({
        default: 1,
        overrides: [
          { _uuid: "mock-uuid-1", score: 2, className: { op: "EQ", value: "Foo" } },
          { _uuid: "mock-uuid-2", score: 3, className: { op: "EQ", value: "Bar" } },
        ],
      });
    });
  });

  describe("Utility: scoreWeightingToRaw()", () => {
    it("discards UUID in each element of `override` array", () => {
      const sc: ScoreWeighting<XUnitOverride> = {
        default: 1,
        overrides: [
          { _uuid: "mock-uuid-1", score: 2, className: { op: "EQ", value: "Foo" } },
          { _uuid: "mock-uuid-2", score: 3, className: { op: "EQ", value: "Bar" } },
        ],
      };
      const scRaw = stageRawConfig.scoreWeightingToRaw(sc);
      expect(scRaw).toStrictEqual({
        default: 1,
        overrides: [
          { score: 2, className: { op: "EQ", value: "Foo" } },
          { score: 3, className: { op: "EQ", value: "Bar" } },
        ],
      });
    });
  });

  describe("Utility: testCaseToRaw()", () => {
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
      expect(output).not.toContainAnyKeys(["_stdinInputMode", "_expectedInputMode", "_valgrindOverride"]);
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
      expect(output).toStrictEqual({
        id: 1,
        file: "a.out",
        visibility: "ALWAYS_VISIBLE",
        args: ["1", "2"], // Convert to array
        score: 5,
        // `stdin` & `file_stdin` are undefined since `_stdinInputMode` is "none"
        stdin: undefined,
        file_stdin: undefined,
        expected: undefined, // since `_expectedInputMode` is "file"
        file_expected: "expected.txt", // Trim string
        valgrind: undefined, // since `_valgrindOverride` is false
      });
    });
  });
});
