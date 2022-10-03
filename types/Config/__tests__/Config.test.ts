import { readFileSync } from "fs";
import Config from "../Config";
import Settings, { SettingsLang, SettingsUseTemplate } from "../Settings";
import Stage from "../Stage";

describe("Config", () => {
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

    const config = Config.fromYaml(yaml);

    const _settings = config._settings;
    expect(_settings.use_template).toBe("PATH");
    expect(_settings.use_skeleton).toBe(true);

    const stages = config.stages;
    expect(stages.length).toBe(3);
    expect(stages[0].id).toBe("compile");
    expect(stages[0].type).toBe("Compile");
    expect(stages[0].config).toEqual({
      input: ["*.cpp"],
      output: "a.out",
    });
    expect(stages[1].config.testCases[0].args).toEqual([1]);
    expect(stages[1].type).toBe("StdioTest");
  });

  it("de-serializes to a YAML string", () => {
    const _settings = new Settings(
      new SettingsLang("cpp", "g++", "8"),
      SettingsUseTemplate.PATH,
      undefined,
      true,
      true,
      10,
      undefined,
      undefined,
      undefined,
      { network: true },
    );
    const stages: Stage[] = [
      new Stage("compile", { input: ["*.cpp"], output: "a.out" }),
      new Stage("score", { normalizedTo: 100 }),
    ];
    const config = new Config(_settings, stages);

    const expected = readFileSync("types/Config/__tests__/config-test.yml").toString();
    const output = config.toYaml();
    expect(output).toBe(expected);
  });
});
