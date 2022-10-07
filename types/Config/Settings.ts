import { ParsedConfig } from "./Config";

/**
 * General configurations across the pipeline. Corresponds to the `_settings` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings}
 */
class Settings {
  constructor(
    public lang: SettingsLang = new SettingsLang("cpp", "g++", ""),
    public use_template?: SettingsUseTemplate,
    public template?: string[],
    public use_skeleton: boolean = false,
    public use_provided: boolean = false,
    public stage_wait_duration_secs: number = 60,
    public cpus: number = 2.0,
    public mem_gb: number = 4.0,
    public early_return_on_throw: boolean = false,
    public enable_features: SettingsFeatures = new SettingsFeatures(true),
  ) {}

  /**
   * Creates a `Settings` instance from an object representation of the `_settings` field in the
   * configuration YAML.
   */
  static fromYamlObject(s: ParsedConfig["_settings"]): Settings {
    return new Settings(
      SettingsLang.fromString(s.lang),
      s.use_template,
      s.template,
      s.use_skeleton,
      s.use_provided,
      s.stage_wait_duration_secs,
      s.cpus,
      s.mem_gb,
      s.early_return_on_throw,
      s.enable_features,
    );
  }

  /**
   * Converts to an object representation of the `_settings` field in the configuration YAML.
   */
  toYamlObject(): ParsedConfig["_settings"] {
    const settings = { ...this, lang: this.lang?.toString() };
    // Since js-yaml cannot parse fields with value `undefined`, we convert them to `null`
    const settingsStr = JSON.stringify(settings, (_, v) => (v === undefined ? null : v));
    return JSON.parse(settingsStr);
  }
}

/**
 * Class representation of the `_settings.lang` field.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-lang}
 */
export class SettingsLang {
  // prettier-ignore
  constructor(
    public language: string,
    public compiler: string | null,
    public version: string,
  ) {}

  /**
   * Creates an instance from the `_settings.lang` string (e.g. `"cpp/g++:8"`).
   * @param lang It's assumed to be correctly formatted.
   */
  static fromString(lang: string): SettingsLang {
    const langRegex = /(.+?)(?:\/(.*))?:(.+)/g;
    const groups = langRegex.exec(lang);
    if (groups === null) {
      throw new Error("Invalid format for `_settings.lang` string");
    }
    return new SettingsLang(groups[1], groups[2] || null, groups[3]);
  }

  /**
   * De-serializes the instance to a string (e.g. `"cpp/g++:8"`).
   */
  toString(): string {
    const { language, compiler, version } = this;
    return `${language}${compiler ? `/${compiler}` : ""}:${version}`;
  }
}

/**
 * Enum for `_settings.use_template`.
 */
export enum SettingsUseTemplate {
  /**
   * Take from the list of files uploaded by the TA on what files the student should submit.
   */
  PATH = "PATH",

  /**
   * Take list of files from the `_settings.template` field.
   */
  FILENAMES = "FILENAMES",
}

/**
 * The `_settings.enable_features` field.
 */
class SettingsFeatures {
  // prettier-ignore
  constructor(
    public network: boolean = true,
    public gpu_device?: SettingsGpuDevice[] | "ANY"
  ) {}
}

/**
 * The `_settings.enable_features.gpu` field.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-enable-features-gpu}
 */
export enum SettingsGpuDevice {
  NVIDIA = "NVIDIA",
  AMD = "AMD",
  INTEL = "INTEL",
}

export default Settings;
