import { Settings, SettingsLang } from "../../../types/Config";
import { parseLangString, settingsLangToString, settingsToYamlObj } from "../settings";

describe("Settings utils", () => {
  it("replaces undefined with null when converting to YAML object", () => {
    const settings: Settings = {
      lang: {
        language: "cpp",
        compiler: "g++",
        version: "8",
      },
      use_template: undefined,
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
    };

    const output = settingsToYamlObj(settings);
    expect(output.use_template).toBe(null);
    expect(output.template).toBe(null);
  });

  describe("SettingsLang", () => {
    it("parses the lang string", () => {
      const cpp = parseLangString("cpp/g++:8");
      expect(cpp.language).toBe("cpp");
      expect(cpp.compiler).toBe("g++");
      expect(cpp.version).toBe("8");

      const java = parseLangString("java:17.0.2");
      expect(java.language).toBe("java");
      expect(java.compiler).toBe(null);
      expect(java.version).toBe("17.0.2");
    });

    it("de-serializes to a string", () => {
      const cpp: SettingsLang = {
        language: "cpp",
        compiler: "g++",
        version: "8",
      };
      expect(settingsLangToString(cpp)).toBe("cpp/g++:8");

      const java: SettingsLang = {
        language: "java",
        compiler: null,
        version: "17.0.2",
      };
      expect(settingsLangToString(java)).toBe("java:17.0.2");
    });
  });
});
