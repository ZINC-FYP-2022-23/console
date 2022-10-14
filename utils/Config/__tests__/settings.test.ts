import cloneDeep from "lodash/cloneDeep";
import { Settings, SettingsGpuDevice, SettingsLang } from "../../../types/Config";
import { isSettingsEqual, parseLangString, settingsLangToString, settingsToYamlObj, tidySettings } from "../settings";

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
  mem_gb: 4.5,
  early_return_on_throw: false,
  enable_features: {
    network: true,
    gpu_device: [SettingsGpuDevice.AMD, SettingsGpuDevice.INTEL],
  },
};

describe("Settings utils", () => {
  describe("settingsToYamlObj()", () => {
    it("replaces undefined with null when converting to YAML object", () => {
      const output = settingsToYamlObj(settings);
      expect(output.use_template).toBe(null);
      expect(output.template).toBe(null);
    });

    it("converts `lang` field to a string representation", () => {
      const output = settingsToYamlObj(settings);
      expect(output.lang).toBe("cpp/g++:8");
    });
  });

  describe("tidySettings()", () => {
    it("tidies a settings object", () => {
      const settingsUgly = cloneDeep(settings);
      settingsUgly.cpus = "2";
      settingsUgly.mem_gb = "4.5";
      settingsUgly.stage_wait_duration_secs = "10";
      settingsUgly.enable_features.gpu_device = [SettingsGpuDevice.INTEL, SettingsGpuDevice.AMD];

      const settingsTidied = tidySettings(settingsUgly);
      expect(settingsTidied).toEqual(settings);
    });

    it("does not modify the original settings object", () => {
      const settingsUgly = cloneDeep(settings);
      settingsUgly.cpus = "2";

      tidySettings(settingsUgly);
      expect(settingsUgly.cpus).toBe("2");
    });
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

  describe("isSettingsEqual()", () => {
    it("returns true for equal settings", () => {
      const s2 = cloneDeep(settings);
      // Test numerical string parsing and gpu_device sorting
      s2.stage_wait_duration_secs = "10";
      s2.mem_gb = "4.5";
      s2.enable_features.gpu_device = [SettingsGpuDevice.INTEL, SettingsGpuDevice.AMD];

      expect(isSettingsEqual(settings, s2)).toBe(true);
    });
  });
});
