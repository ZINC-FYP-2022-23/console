import { Config, Settings, StageDataMap, StageDependencyMap, StageKind } from "@types";
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
      const _settings: Settings = {
        lang: {
          language: "cpp",
          compiler: "g++",
          version: "8",
        },
        template: [{ id: "mock-uuid-1", name: "" }],
        use_skeleton: true,
        use_provided: true,
        stage_wait_duration_secs: "10",
        cpus: "2",
        mem_gb: "4",
        early_return_on_throw: false,
        enable_features: {
          network: true,
        },
      };
      const stageDeps: StageDependencyMap = {
        "mock-uuid-1": [],
        "mock-uuid-2": ["mock-uuid-1"],
      };
      const stageData: StageDataMap = {
        "mock-uuid-1": {
          key: "compile",
          name: "Compile",
          kind: StageKind.PRE_LOCAL,
          config: { input: ["*.cpp"], output: "a.out" },
        },
        "mock-uuid-2": {
          key: "score",
          name: "Score",
          kind: StageKind.POST,
          config: { normalizedTo: 100.0 },
        },
      };
      const config: Config = {
        _settings,
        stageDeps,
        stageData,
      };

      const settingsToRawMock = jest.spyOn(settingsUtils, "settingsToSettingsRaw");
      const stagesToYamlMock = jest.spyOn(stageUtils, "stagesToYamlObj");
      configToYaml(config);

      expect(settingsToRawMock).toBeCalledWith(_settings);
      expect(stagesToYamlMock).toBeCalledWith(stageDeps, stageData);
    });
  });
});
