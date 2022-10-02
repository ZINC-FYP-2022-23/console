import { ParsedConfig } from "./Config";

/**
 * General configurations across the pipeline. Corresponds to the `_settings` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings}
 */
class Settings {
  constructor(
    /** Although this field is required, it can be `undefined` when the user hasn't chosen a language. */
    public lang?: SettingsLang,
    public use_template?: SettingsUseTemplate,
    public template?: string[],
    public use_skeleton?: boolean,
    public use_provided?: boolean,
    public stage_wait_duration_secs?: number,
    public cpus?: number,
    public mem_gb?: number,
    public early_return_on_throw?: boolean,
    public enable_features?: SettingsFeatures,
  ) {}

  /**
   * Creates a `Settings` instance from an object representation of the `_settings` field in the
   * configuration YAML.
   */
  static fromYamlObject(s: ParsedConfig["_settings"]): Settings {
    return new Settings(
      Settings.serializeLang(s.lang),
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
   * Parses the `_settings.lang` string (e.g. `"cpp/g++:8"`) to a {@link SettingsLang} object.
   * @param lang It's assumed to be correctly formatted.
   */
  static serializeLang(lang: string): SettingsLang {
    const langRegex = /(.+?)(?:\/(.*))?:(.+)/g;
    const groups = langRegex.exec(lang);
    if (groups === null) {
      throw new Error("Invalid format for `_settings.lang` string");
    }
    return {
      language: groups[1],
      compiler: groups[2] || null,
      version: groups[3],
    };
  }
}

/**
 * Object representation of the `_settings.lang` field.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-lang}
 */
export interface SettingsLang {
  language: string;
  compiler: string | null;
  version: string;
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
export interface SettingsFeatures {
  network?: boolean;
  gpu_device?: SettingsGpuDevice[] | "ANY";
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
