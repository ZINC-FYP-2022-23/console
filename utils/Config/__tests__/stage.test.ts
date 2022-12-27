import supportedStages from "@constants/Config/supportedStages";
import {
  Compile,
  CompileRaw,
  FileStructureValidation,
  Score,
  ScoreRaw,
  Stage,
  StageDataMap,
  StageDependencyMap,
  StageKind,
} from "@types";
import * as uuid from "uuid";
import {
  configsToConfigsRaw,
  deleteStageFromDeps,
  generateStageLabels,
  getStageNameAndLabel,
  isStageDependencyEqual,
  parseStages,
  stagesToYamlObj,
  transposeStageDeps,
} from "../stage";

jest.mock("uuid");

const yamlObj = {
  diffWithSkeleton: {
    exclude_from_provided: true,
  },
  fileStructureValidation: {
    ignore_in_submission: ["*.out"],
  },
  "compile:all": {
    input: ["*.cpp"],
    output: "a.out",
  },
};

const stageDeps: StageDependencyMap = {
  "mock-uuid-1": [],
  "mock-uuid-2": ["mock-uuid-1"],
  "mock-uuid-3": ["mock-uuid-2"],
};

const stageData: StageDataMap = {
  "mock-uuid-1": {
    name: "DiffWithSkeleton",
    label: "",
    kind: StageKind.PRE_GLOBAL,
    config: {
      exclude_from_provided: true,
    },
  },
  "mock-uuid-2": {
    name: "FileStructureValidation",
    label: "",
    kind: StageKind.PRE_GLOBAL,
    config: {
      ignore_in_submission: ["*.out"],
    },
  },
  "mock-uuid-3": {
    name: "Compile",
    label: "all",
    kind: StageKind.PRE_LOCAL,
    config: {
      input: ["*.cpp"],
      output: "a.out",
    },
  },
};

describe("Stage utils", () => {
  describe("getStageNameAndLabel()", () => {
    it("gets the stage name and label", () => {
      expect(getStageNameAndLabel("compile")).toEqual(["Compile", ""]);
      expect(getStageNameAndLabel("stdioTest:hidden")).toEqual(["StdioTest", "hidden"]);
    });
  });

  describe("parseStages()", () => {
    const createRawStage = <T = object>(key: string, config: T) => ({
      [key]: config,
    });

    const MOCK_ID = "mock-uuid-1";

    beforeEach(() => {
      jest.spyOn(uuid, "v4").mockReturnValue(MOCK_ID);
    });

    it("parses stages from a config YAML object", () => {
      jest
        .spyOn(uuid, "v4")
        .mockReturnValueOnce("mock-uuid-1")
        .mockReturnValueOnce("mock-uuid-2")
        .mockReturnValueOnce("mock-uuid-3");

      expect(parseStages(yamlObj)).toEqual([stageDeps, stageData]);
    });

    it("handles unsupported stage", () => {
      const yamlObj = {
        foo: {
          bar: "baz",
        },
      };
      const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
      const [_, stageData] = parseStages(yamlObj);

      expect(consoleWarnMock).toHaveBeenCalled();
      expect(stageData[MOCK_ID].kind).toBe(StageKind.GRADING);

      consoleWarnMock.mockRestore();
    });

    describe("Compile", () => {
      it("converts flags array to a string", () => {
        const stage = createRawStage<CompileRaw>("compile", {
          input: ["*.cpp"],
          flags: ["-Wall", "-Wextra", "-g"],
        });
        expect(parseStages(stage)[1][MOCK_ID].config).toEqual({
          input: ["*.cpp"],
          flags: "-Wall -Wextra -g",
        });
      });
    });

    describe("Score", () => {
      it("converts all numerical fields to strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
        expect(parseStages(stage)[1][MOCK_ID].config).toEqual({
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
      });

      it("converts all undefined fields to empty strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
        });
        expect(parseStages(stage)[1][MOCK_ID].config).toEqual({
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
      });
    });
  });

  describe("transposeStageDeps()", () => {
    it("transposes a linked list graph", () => {
      // C <- B <- A
      const stageDeps: StageDependencyMap = {
        A: ["B"],
        B: ["C"],
        C: [],
      };
      // C -> B -> A
      const expected = {
        A: [],
        B: ["A"],
        C: ["B"],
      };
      const output = transposeStageDeps(stageDeps);
      expect(output).toEqual(expected);
    });

    it("transposes a branched directed acyclic graph", () => {
      //     ┌─ B <─┐
      // D <─┴─ C <─┴─ A
      const stageDeps: StageDependencyMap = {
        A: ["B", "C"],
        B: ["D"],
        C: ["D"],
        D: [],
      };
      //     ┌─> B ─┐
      // D ──┴─> C ─┴─> A
      const expected = {
        A: [],
        B: ["A"],
        C: ["A"],
        D: ["B", "C"],
      };
      const output = transposeStageDeps(stageDeps);
      expect(output).toEqual(expected);
    });
  });

  describe("deleteStageFromDeps()", () => {
    it("deletes a stage located at the middle of linked list", () => {
      // C <- B <- A
      const stageDeps: StageDependencyMap = {
        A: ["B"],
        B: ["C"],
        C: [],
      };
      deleteStageFromDeps("B", stageDeps);
      expect(stageDeps).toEqual({
        A: [],
        C: [],
      });
    });

    it("deletes a stage located at the end of linked list", () => {
      // C <- B <- A
      const stageDeps: StageDependencyMap = {
        A: ["B"],
        B: ["C"],
        C: [],
      };
      deleteStageFromDeps("C", stageDeps);
      expect(stageDeps).toEqual({
        A: ["B"],
        B: [],
      });
    });

    it("deletes a stage at the middle of a branched DAG", () => {
      //     ┌─ B <─┐
      // D <─┴─ C <─┴─ A
      const stageDeps: StageDependencyMap = {
        A: ["B", "C"],
        B: ["D"],
        C: ["D"],
        D: [],
      };
      deleteStageFromDeps("C", stageDeps);
      expect(stageDeps).toEqual({
        A: ["B"],
        B: ["D"],
        D: [],
      });
    });

    it("handles deleting a stage that does not exist", () => {
      // B <- A
      const stageDeps: StageDependencyMap = {
        A: ["B"],
        B: [],
      };
      const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
      deleteStageFromDeps("C", stageDeps);
      expect(stageDeps).toEqual(stageDeps); // Remains unchanged
      expect(consoleWarnMock).toHaveBeenCalled();

      consoleWarnMock.mockRestore();
    });
  });

  describe("stagesToYamlObj()", () => {
    it("converts stage order and data to a config YAML object", () => {
      expect(stagesToYamlObj(stageDeps, stageData)).toEqual(yamlObj);
    });

    it("orders stage correctly when key order of stage dependency map is shuffled", () => {
      const shuffledStageDeps: StageDependencyMap = {
        "mock-uuid-2": ["mock-uuid-1"],
        "mock-uuid-3": ["mock-uuid-2"],
        "mock-uuid-1": [],
      };
      expect(stagesToYamlObj(shuffledStageDeps, stageData)).toEqual(yamlObj);
    });

    it("handles a single-staged pipeline", () => {
      const stageDeps: StageDependencyMap = { "mock-uuid-1": [] };
      const stageData: StageDataMap = {
        "mock-uuid-1": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {
            exclude_from_provided: true,
          },
        },
      };
      const expected = {
        diffWithSkeleton: {
          exclude_from_provided: true,
        },
      };

      expect(stagesToYamlObj(stageDeps, stageData)).toEqual(expected);
    });
  });

  describe("isStageDependencyEqual()", () => {
    it("handles linked list dependency graphs", () => {
      // 1 <- 2 <- 3
      const deps1: StageDependencyMap = {
        "1": [],
        "2": ["1"],
        "3": ["2"],
      };
      // 1 <- 2 <- 3
      const deps2: StageDependencyMap = {
        "3": ["2"],
        "2": ["1"],
        "1": [],
      };
      // 1 <- 2 <- 3 <- 4
      const deps3: StageDependencyMap = {
        "1": [],
        "2": ["1"],
        "3": ["2"],
        "4": ["3"],
      };

      expect(isStageDependencyEqual(deps1, deps2)).toBe(true);
      expect(isStageDependencyEqual(deps1, deps3)).toBe(false);
    });

    it("handles branched directed acyclic dependency graphs", () => {
      //     ┌─ 2 <─┐
      // 4 <─┴─ 3 <─┴─ 1
      const deps1: StageDependencyMap = {
        "1": ["2", "3"],
        "2": ["4"],
        "3": ["4"],
        "4": [],
      };
      //     ┌─ 2 <─┐
      // 4 <─┴─ 3 <─┴─ 1
      const deps2: StageDependencyMap = {
        "2": ["4"],
        "4": [],
        "3": ["4"],
        "1": ["3", "2"],
      };
      //     ┌─ 2 <─┐
      // 1 <─┴─ 3 <─┴─ 4
      const deps3: StageDependencyMap = {
        "1": [],
        "2": ["1"],
        "3": ["1"],
        "4": ["2", "3"],
      };

      expect(isStageDependencyEqual(deps1, deps2)).toBe(true);
      expect(isStageDependencyEqual(deps1, deps3)).toBe(false);
    });
  });

  describe("generateStageLabels()", () => {
    const createStage = (name: string, label = ""): Stage => ({
      name,
      label,
      kind: StageKind.PRE_GLOBAL,
      config: {},
    });

    const mathRandomMock = jest.spyOn(Math, "random");

    it("generates random labels if exist >=2 stages of same name with empty labels", () => {
      mathRandomMock.mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);
      const stageData: StageDataMap = {
        "uuid-1": createStage("Compile"),
        "uuid-2": createStage("DiffWithSkeleton"),
        "uuid-3": createStage("Compile", "all"),
        "uuid-4": createStage("Compile"),
      };
      expect(generateStageLabels(stageData)).toEqual({
        "uuid-1": createStage("Compile", (0.1).toString(36).slice(2, 8)),
        "uuid-2": createStage("DiffWithSkeleton"),
        "uuid-3": createStage("Compile", "all"),
        "uuid-4": createStage("Compile", (0.2).toString(36).slice(2, 8)),
      });
    });

    it("does nothing if there are no >=2 stages of same name with empty labels", () => {
      const stageData: StageDataMap = {
        "uuid-1": createStage("DiffWithSkeleton"),
        "uuid-2": createStage("Compile", "student"),
        "uuid-3": createStage("Compile", "main"),
        "uuid-4": createStage("Score"),
      };
      expect(generateStageLabels(stageData)).toEqual(stageData);
    });
  });

  describe("configsToConfigsRaw()", () => {
    const MOCK_ID = "mock-uuid-1";

    const createStage = <T = object>(name: string, config: T): StageDataMap => ({
      [MOCK_ID]: {
        name,
        label: "",
        kind: supportedStages[name].kind,
        config,
      },
    });

    beforeEach(() => {
      jest.spyOn(uuid, "v4").mockReturnValue(MOCK_ID);
    });

    describe("Compile", () => {
      it("trims the string in output", () => {
        const stageData = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          output: "  a.out  ",
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config.output).toBe("a.out");
      });

      it("converts flags to string array", () => {
        const stageData = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          flags: "  -Wall -Wextra   -g   ",
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config.flags).toEqual(["-Wall", "-Wextra", "-g"]);
      });
    });

    describe("FileStructureValidation", () => {
      it("trims and removes empty strings in ignore_in_submission", () => {
        const stageData = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: ["  a.txt", "", "b.txt  "],
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config.ignore_in_submission).toEqual(["a.txt", "b.txt"]);
      });

      it("converts empty ignore_in_submission array to undefined", () => {
        const stageData = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: [],
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config.ignore_in_submission).toBeUndefined();
      });
    });

    describe("Score", () => {
      it("converts numerical strings to numbers", () => {
        const stageData = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config).toEqual({
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
      });

      it("converts empty strings to undefined", () => {
        const stageData = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
        const _stageData = configsToConfigsRaw(stageData);
        expect(_stageData[MOCK_ID].config).toEqual({
          normalizedTo: 100,
          minScore: undefined,
          maxScore: undefined,
        });
      });
    });
  });
});
