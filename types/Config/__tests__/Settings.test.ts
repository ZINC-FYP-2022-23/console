import Settings, { SettingsLang, SettingsUseTemplate } from "../Settings";

describe("Settings", () => {
  it("replaces undefined with null when converting to YAML object", () => {
    const settings = new Settings(undefined, SettingsUseTemplate.PATH);
    const output = settings.toYamlObject();
    expect(output.lang).toBe(null);
    expect(output.use_template).toBe("PATH");
  });

  describe("SettingsLang", () => {
    it("parses the lang string", () => {
      const cpp = SettingsLang.fromString("cpp/g++:8");
      expect(cpp.language).toBe("cpp");
      expect(cpp.compiler).toBe("g++");
      expect(cpp.version).toBe("8");

      const java = SettingsLang.fromString("java:17.0.2");
      expect(java.language).toBe("java");
      expect(java.compiler).toBe(null);
      expect(java.version).toBe("17.0.2");
    });

    it("de-serializes to a string", () => {
      const cpp = new SettingsLang("cpp", "g++", "8");
      expect(cpp.toString()).toBe("cpp/g++:8");

      const java = new SettingsLang("java", null, "17.0.2");
      expect(java.toString()).toBe("java:17.0.2");
    });
  });
});
