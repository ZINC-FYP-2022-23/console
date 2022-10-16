import { Config, Settings, Stage, StageKind } from "@types";
import { configToYaml, parseConfigYaml } from "../config";
import * as settingsUtils from "../settings";
import * as stageUtils from "../stage";

describe("Config utils", () => {
  it("parses a YAML config", () => {
    const yaml = `
      _settings:
        lang: cpp/g++:8
        use_template: PATH
        use_skeleton: true
      compile:
        input: [ "*.cpp" ]
        output: a.out
      stdioTest:
        testCases:
          - file: a.out
            id: 1
            args: [ 1 ]
            stdin: ~
            expected: 1
            visibility: ALWAYS_VISIBLE
            score: 5
      score:
        normalizedTo: 100.0
    `;

    const config = parseConfigYaml(yaml);

    const _settings = config._settings;
    expect(_settings.use_template).toBe("PATH");
    expect(_settings.use_skeleton).toBe(true);

    const stages = config.stages;
    expect(stages.length).toBe(3);
    expect(stages[0].id).toBe("compile");
    expect(stages[0].config).toEqual({
      input: ["*.cpp"],
      output: "a.out",
    });
    expect(stages[1].config.testCases[0].args).toEqual([1]);
  });

  it("de-serializes to a YAML string", () => {
    const _settings: Settings = {
      lang: {
        language: "cpp",
        compiler: "g++",
        version: "8",
      },
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
    const stages: Stage[] = [
      {
        id: "compile",
        name: "Compile",
        kind: StageKind.PRE_LOCAL,
        config: { input: ["*.cpp"], output: "a.out" },
      },
    ];
    const config: Config = {
      _settings,
      stages,
    };

    const settingsToRawMock = jest.spyOn(settingsUtils, "settingsToSettingsRaw");
    const stagesToYamlMock = jest.spyOn(stageUtils, "stagesToYamlObj");
    configToYaml(config);
    expect(settingsToRawMock).toBeCalledWith(_settings);
    expect(stagesToYamlMock).toBeCalledWith(stages);
  });
});
