import { readFileSync } from "fs";
import { Config, SettingsUseTemplate } from "../../../types/Config";
import { configToYaml, parseConfigYaml } from "../config";

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
    const config: Config = {
      _settings: {
        lang: {
          language: "cpp",
          compiler: "g++",
          version: "8",
        },
        use_template: SettingsUseTemplate.PATH,
        template: undefined,
        use_skeleton: true,
        use_provided: true,
        stage_wait_duration_secs: 10,
        cpus: 2,
        mem_gb: 4,
        early_return_on_throw: false,
        enable_features: {
          network: true,
        },
      },
      stages: [
        {
          id: "compile",
          config: { input: ["*.cpp"], output: "a.out" },
        },
        {
          id: "score",
          config: { normalizedTo: 100 },
        },
      ],
    };

    const expected = readFileSync("utils/Config/__tests__/config-test.yml").toString();
    const output = configToYaml(config);
    expect(output).toBe(expected);
  });
});
