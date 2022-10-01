import { ParsedConfig } from "./Config";

/**
 * General configurations across the pipeline. Corresponds to the `_settings` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings}
 */
class Settings {
  lang: SettingsLang;
  use_template: SettingsUseTemplate | null;
  template?: string[];
  use_skeleton?: boolean;
  use_provided?: boolean;
  stage_wait_duration_secs?: number;
  cpus?: number;
  mem_gb?: number;
  early_return_on_throw?: boolean;
  enable_features?: SettingsFeatures;

  constructor(settings: ParsedConfig["_settings"]) {
    this.lang = Settings.serializeLang(settings.lang);
    this.use_template = settings.use_template;
    this.template = settings.template;
    this.use_skeleton = settings.use_skeleton;
    this.use_provided = settings.use_provided;
    this.stage_wait_duration_secs = settings.stage_wait_duration_secs;
    this.cpus = settings.cpus;
    this.mem_gb = settings.mem_gb;
    this.early_return_on_throw = settings.early_return_on_throw;
    this.enable_features = settings.enable_features;
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
