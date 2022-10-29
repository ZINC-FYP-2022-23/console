import { StageChildren, StageDataMap, StageDependency, StageKind } from "@types";
import * as uuid from "uuid";
import { getStageType, isStageDependencyEqual, parseStages, stagesToYamlObj, transposeStages } from "../stage";

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

const stageDeps: StageDependency[] = [
  { id: "mock-uuid-1", dependsOn: null },
  { id: "mock-uuid-2", dependsOn: ["mock-uuid-1"] },
  { id: "mock-uuid-3", dependsOn: ["mock-uuid-2"] },
];

const stageData: StageDataMap = {
  "mock-uuid-1": {
    key: "diffWithSkeleton",
    name: "DiffWithSkeleton",
    kind: StageKind.PRE_GLOBAL,
    config: {
      exclude_from_provided: true,
    },
  },
  "mock-uuid-2": {
    key: "fileStructureValidation",
    name: "FileStructureValidation",
    kind: StageKind.PRE_GLOBAL,
    config: {
      ignore_in_submission: ["*.out"],
    },
  },
  "mock-uuid-3": {
    key: "compile:all",
    name: "Compile",
    kind: StageKind.PRE_LOCAL,
    config: {
      input: ["*.cpp"],
      output: "a.out",
    },
  },
};

describe("Stage utils", () => {
  describe("getStageType()", () => {
    it("gets the stage type", () => {
      expect(getStageType("stdioTest")).toBe("StdioTest");
      expect(getStageType("compile:main")).toBe("Compile");
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

  describe("transposeStages()", () => {
    it("transposes a linked list graph", () => {
      // 3 <- 2 <- 1
      const stageDeps: StageDependency[] = [
        { id: "1", dependsOn: ["2"] },
        { id: "2", dependsOn: ["3"] },
        { id: "3", dependsOn: null },
      ];
      // 3 -> 2 -> 1
      const expected: StageChildren[] = [
        { id: "1", children: [] },
        { id: "2", children: ["1"] },
        { id: "3", children: ["2"] },
      ];
      const output = transposeStages(stageDeps);
      expect(output).toEqual(expected);
    });

    it("transposes a branched directed acyclic graph", () => {
      //     ┌─ 2 <─┐
      // 4 <─┴─ 3 <─┴─ 1
      const stageDeps: StageDependency[] = [
        { id: "1", dependsOn: ["2", "3"] },
        { id: "2", dependsOn: ["4"] },
        { id: "3", dependsOn: ["4"] },
        { id: "4", dependsOn: null },
      ];
      //     ┌─> 2 ─┐
      // 4 ──┴─> 3 ─┴─> 1
      const expected: StageChildren[] = [
        { id: "1", children: [] },
        { id: "2", children: ["1"] },
        { id: "3", children: ["1"] },
        { id: "4", children: ["2", "3"] },
      ];
      const output = transposeStages(stageDeps);
      expect(output).toEqual(expected);
    });
  });

  describe("stagesToYamlObj()", () => {
    it("converts stage order and data to a config YAML object", () => {
      expect(stagesToYamlObj(stageDeps, stageData)).toEqual(yamlObj);
    });

    it("orders stage correctly when stage dependencies array is shuffled", () => {
      const shuffledStageDeps: StageDependency[] = [
        { id: "mock-uuid-2", dependsOn: ["mock-uuid-1"] },
        { id: "mock-uuid-3", dependsOn: ["mock-uuid-2"] },
        { id: "mock-uuid-1", dependsOn: null },
      ];
      expect(stagesToYamlObj(shuffledStageDeps, stageData)).toEqual(yamlObj);
    });

    it("handles a single-staged pipeline", () => {
      const stageDeps: StageDependency[] = [{ id: "mock-uuid-1", dependsOn: null }];
      const stageData: StageDataMap = {
        "mock-uuid-1": {
          key: "diffWithSkeleton",
          name: "DiffWithSkeleton",
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
      const deps1: StageDependency[] = [
        { id: "1", dependsOn: null },
        { id: "2", dependsOn: ["1"] },
        { id: "3", dependsOn: ["2"] },
      ];
      // 1 <- 2 <- 3
      const deps2: StageDependency[] = [
        { id: "3", dependsOn: ["2"] },
        { id: "2", dependsOn: ["1"] },
        { id: "1", dependsOn: null },
      ];
      // 1 <- 2 <- 3 <- 4
      const deps3: StageDependency[] = [
        { id: "1", dependsOn: null },
        { id: "2", dependsOn: ["1"] },
        { id: "3", dependsOn: ["2"] },
        { id: "4", dependsOn: ["3"] },
      ];

      expect(isStageDependencyEqual(deps1, deps2)).toBe(true);
      expect(isStageDependencyEqual(deps1, deps3)).toBe(false);
    });

    it("handles branched directed acyclic dependency graphs", () => {
      //     ┌─ 2 <─┐
      // 4 <─┴─ 3 <─┴─ 1
      const deps1: StageDependency[] = [
        { id: "1", dependsOn: ["2", "3"] },
        { id: "2", dependsOn: ["4"] },
        { id: "3", dependsOn: ["4"] },
        { id: "4", dependsOn: null },
      ];
      //     ┌─ 2 <─┐
      // 4 <─┴─ 3 <─┴─ 1
      const deps2: StageDependency[] = [
        { id: "2", dependsOn: ["4"] },
        { id: "4", dependsOn: null },
        { id: "3", dependsOn: ["4"] },
        { id: "1", dependsOn: ["3", "2"] },
      ];
      //     ┌─ 2 <─┐
      // 1 <─┴─ 3 <─┴─ 4
      const deps3: StageDependency[] = [
        { id: "1", dependsOn: null },
        { id: "2", dependsOn: ["4"] },
        { id: "3", dependsOn: ["4"] },
        { id: "4", dependsOn: ["2", "3"] },
      ];

      expect(isStageDependencyEqual(deps1, deps2)).toBe(true);
      expect(isStageDependencyEqual(deps1, deps3)).toBe(false);
    });
  });
});
