import { FileStructureValidation, StageDataMap, StageDependencyMap, StageKind } from "@types";
import * as uuid from "uuid";
import {
  deleteStageFromDeps,
  getStageNameAndLabel,
  isStageDependencyEqual,
  parseStages,
  stagesToYamlObj,
  tidyStageDataConfigs,
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

      const mockedId = "mock-uuid-1";
      const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
      jest.spyOn(uuid, "v4").mockReturnValue(mockedId);

      const [_, stageData] = parseStages(yamlObj);

      expect(consoleWarnMock).toHaveBeenCalled();
      expect(stageData[mockedId].kind).toBe(StageKind.GRADING);

      consoleWarnMock.mockRestore();
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

  describe("tidyStageDataConfigs()", () => {
    describe("FileStructureValidation", () => {
      const createStageData = (config: FileStructureValidation): StageDataMap => ({
        "mock-uuid-0": {
          name: "FileStructureValidation",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config,
        },
      });

      it("trims and removes empty strings in ignore_in_submission", () => {
        const stageData = createStageData({
          ignore_in_submission: ["  a.txt", "", "b.txt  "],
        });
        const _stageData = tidyStageDataConfigs(stageData);
        expect(_stageData["mock-uuid-0"].config.ignore_in_submission).toEqual(["a.txt", "b.txt"]);
      });

      it("converts empty ignore_in_submission array to undefined", () => {
        const stageData = createStageData({
          ignore_in_submission: [],
        });
        const _stageData = tidyStageDataConfigs(stageData);
        expect(_stageData["mock-uuid-0"].config.ignore_in_submission).toBeUndefined();
      });
    });
  });
});
