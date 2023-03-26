import { Settings, SettingsGpuDevice, SettingsLang, SettingsRaw, SettingsUseTemplate } from "@/types/GuiBuilder";
import * as uuid from "uuid";
import {
  isSettingsEqual,
  parseLangString,
  settingsLangToString,
  settingsRawToSettings,
  settingsToSettingsRaw,
  tidySettings,
} from "../settings";

jest.mock("uuid");

function getMockSettings(): Settings {
  return {
    lang: {
      language: "cpp",
      compiler: "g++",
      version: "8",
    },
    use_template: SettingsUseTemplate.FILENAMES,
    template: [
      { id: "mock-uuid-1", name: "foo.cpp" },
      { id: "mock-uuid-2", name: "bar.cpp" },
    ],
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
}

describe("GuiBuilder: Utils - Settings", () => {
  describe("settingsRawToSettings()", () => {
    it("converts a SettingsRaw object to Settings", () => {
      const settingsRaw: SettingsRaw = {
        lang: "cpp/g++:8",
        use_template: SettingsUseTemplate.FILENAMES,
        template: ["foo.cpp", "bar.cpp"],
        cpus: 2.5,
      };
      const expected: Settings = {
        lang: {
          language: "cpp",
          compiler: "g++",
          version: "8",
        },
        use_template: SettingsUseTemplate.FILENAMES,
        template: [
          { id: "mock-uuid-1", name: "foo.cpp" },
          { id: "mock-uuid-2", name: "bar.cpp" },
        ],
        use_skeleton: false,
        use_provided: true,
        cpus: 2.5,
        early_return_on_throw: false,
        enable_features: { network: true },
      };

      jest.spyOn(uuid, "v4").mockReturnValueOnce("mock-uuid-1").mockReturnValueOnce("mock-uuid-2");
      expect(settingsRawToSettings(settingsRaw)).toEqual(expected);
    });
  });

  describe("settingsToSettingsRaw()", () => {
    it("converts `lang` to a string", () => {
      const settingsRaw = settingsToSettingsRaw(getMockSettings());
      expect(settingsRaw.lang).toBe("cpp/g++:8");
    });

    it("keeps the `template` string array only if `use_template` is `FILENAMES`", () => {
      const settings = getMockSettings();
      settings.template = [
        { id: "mock-uuid-1", name: "foo.txt" },
        { id: "mock-uuid-2", name: " bar.txt " },
      ];
      expect(settingsToSettingsRaw(settings).template).toEqual(["foo.txt", "bar.txt"]);

      settings.use_template = SettingsUseTemplate.PATH;
      expect(settingsToSettingsRaw(settings)).not.toHaveProperty("template");

      settings.use_template = undefined;
      expect(settingsToSettingsRaw(settings)).not.toHaveProperty("template");
    });
  });

  describe("tidySettings()", () => {
    it("trims the language version string", () => {
      const settings = getMockSettings();
      settings.lang.version = "  8  ";

      const settingsTidied = tidySettings(settings);
      expect(settingsTidied.lang.version).toBe("8");
    });

    it("tidies the `template` array", () => {
      const settings = getMockSettings();
      settings.template = [
        { id: "mock-uuid-1", name: "  foo.txt" },
        { id: "mock-uuid-2", name: "" },
        { id: "mock-uuid-3", name: "bar.txt " },
      ];

      const settingsTidied = tidySettings(settings);
      expect(settingsTidied.template).toEqual([
        { id: "mock-uuid-1", name: "foo.txt" },
        { id: "mock-uuid-3", name: "bar.txt" },
      ]);
    });

    it("sorts the GPU devices array", () => {
      const settings = getMockSettings();
      settings.enable_features.gpu_device = [SettingsGpuDevice.INTEL, SettingsGpuDevice.AMD];

      const settingsTidied = tidySettings(settings);
      expect(settingsTidied.enable_features.gpu_device).toEqual([SettingsGpuDevice.AMD, SettingsGpuDevice.INTEL]);
    });

    it("does not modify the original settings object", () => {
      const settingsUgly = getMockSettings();
      settingsUgly.lang.version = "  8  ";

      tidySettings(settingsUgly);
      expect(settingsUgly.lang.version).toBe("  8  ");
    });
  });

  describe("parseLangString()", () => {
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
  });

  describe("settingsLangToString()", () => {
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
      const s1 = getMockSettings();
      const s2 = getMockSettings();
      // Test `template` comparison
      s2.template = [
        { id: "mock-uuid-11", name: " bar.cpp  " },
        { id: "mock-uuid-12", name: " foo.cpp " },
      ];
      expect(isSettingsEqual(s1, s2)).toBe(true);
    });
  });
});
