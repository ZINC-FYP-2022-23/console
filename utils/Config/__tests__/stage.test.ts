import { Stage, StageKind } from "@types";
import { getStageType, parseStages, stagesToYamlObj } from "../stage";

const yamlObj = {
  diffWithSkeleton: {
    exclude_from_provided: true,
  },
  "compile:all": {
    input: ["*.cpp"],
    output: "a.out",
  },
};

const stages: Stage[] = [
  {
    id: "diffWithSkeleton",
    name: "DiffWithSkeleton",
    kind: StageKind.PRE_GLOBAL,
    config: {
      exclude_from_provided: true,
    },
  },
  {
    id: "compile:all",
    name: "Compile",
    kind: StageKind.PRE_LOCAL,
    config: {
      input: ["*.cpp"],
      output: "a.out",
    },
  },
];

describe("Stage utils", () => {
  describe("getStageType()", () => {
    it("gets the stage type", () => {
      expect(getStageType("stdioTest")).toBe("StdioTest");
      expect(getStageType("compile:main")).toBe("Compile");
    });
  });

  describe("parseStages()", () => {
    it("parses stages from a config YAML object", () => {
      expect(parseStages(yamlObj)).toEqual(stages);
    });

    it("handles unsupported stage", () => {
      const yamlObj = {
        foo: {
          bar: "baz",
        },
      };
      const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
      const parsedStages = parseStages(yamlObj);
      expect(consoleWarnMock).toHaveBeenCalled();
      expect(parsedStages[0].kind).toBe(StageKind.GRADING);

      consoleWarnMock.mockRestore();
    });
  });

  describe("stagesToYamlObj()", () => {
    it("converts stages to a config YAML object", () => {
      expect(stagesToYamlObj(stages)).toEqual(yamlObj);
    });
  });
});
