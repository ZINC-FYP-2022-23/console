import { defaultSettings } from "@constants/Config/defaults";
import { Config, StageDataMap, StageDependencyMap, StageKind } from "@types";
import cloneDeep from "lodash/cloneDeep";
import { configToYaml, parseConfigYaml } from "../config";
import * as settingsUtils from "../settings";
import * as stageUtils from "../stage";

describe("Config utils", () => {
  describe("parseConfigYaml()", () => {
    it("parses a YAML config", () => {
      const yaml = `
        _settings:
          lang: cpp/g++:8
          use_template: PATH
          use_skeleton: true
        compile:
          input: [ "*.cpp" ]
          output: a.out
        score:
          normalizedTo: 100.0
      `;
      const settingsMock = jest.spyOn(settingsUtils, "settingsRawToSettings");
      const stagesMock = jest.spyOn(stageUtils, "parseStages");
      parseConfigYaml(yaml);

      expect(settingsMock).toBeCalledWith({
        lang: "cpp/g++:8",
        use_template: "PATH",
        use_skeleton: true,
      });
      expect(stagesMock).toBeCalledWith({
        compile: {
          input: ["*.cpp"],
          output: "a.out",
        },
        score: {
          normalizedTo: 100.0,
        },
      });
    });
  });

  describe("configToYaml()", () => {
    it("de-serializes config to a YAML string", () => {
      const stageDeps: StageDependencyMap = {
        "mock-uuid-1": [],
      };
      const stageData: StageDataMap = {
        "mock-uuid-1": {
          key: "compile",
          name: "Compile",
          kind: StageKind.PRE_LOCAL,
          config: { input: ["*.cpp"], output: "a.out" },
        },
      };
      const config: Config = {
        _settings: defaultSettings,
        stageDeps,
        stageData,
      };

      const settingsToRawMock = jest.spyOn(settingsUtils, "settingsToSettingsRaw");
      const stagesToYamlMock = jest.spyOn(stageUtils, "stagesToYamlObj");
      configToYaml(config);

      expect(settingsToRawMock).toBeCalledWith(defaultSettings);
      expect(stagesToYamlMock).toBeCalledWith(stageDeps, stageData);
    });

    it("converts undefined fields to null", () => {
      const _settings = cloneDeep(defaultSettings);
      _settings.use_template = undefined;
      const stageDeps: StageDependencyMap = {
        "mock-uuid-1": [],
      };
      const stageData: StageDataMap = {
        "mock-uuid-1": {
          key: "fileStructureValidation",
          name: "FileStructureValidation",
          kind: StageKind.PRE_GLOBAL,
          config: { ignore_in_submission: undefined },
        },
      };

      const output = configToYaml({ _settings, stageDeps, stageData });
      expect(output).toMatch(/use_template: null/);
      expect(output).toMatch(/ignore_in_submission: null/);
    });
  });
});
