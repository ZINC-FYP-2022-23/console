/**
 * General configurations across the pipeline. Corresponds to the `_settings` field in the config YAML.
 *
 * Its shape is a bit different from {@link https://docs.zinc.ust.dev/user/model/Config.html#settings the one in Grader docs}.
 * This is to facilitate the development of the GUI. See {@link SettingsRaw} for the raw shape.
 */
interface Settings {
  lang: SettingsLang;
  use_template?: SettingsUseTemplate;
  template: {
    /** UUID for the template file. It's randomly generated while serializing the YAML file. */
    id: string;
    /** Name of the template file. */
    name: string;
  }[];
  use_skeleton: boolean;
  use_provided: boolean;
  stage_wait_duration_secs?: number;
  cpus?: number;
  mem_gb?: number;
  early_return_on_throw: boolean;
  enable_features: SettingsFeatures;
}

/**
 * The shape of `_settings` from an input config YAML (e.g. loaded from database).
 *
 * During parsing of config YAML, the `SettingsRaw` object will be transformed to {@link Settings}.
 * Its shape is based from {@link https://docs.zinc.ust.dev/user/model/Config.html#settings the one in the Grader docs}.
 */
export interface SettingsRaw {
  lang: string;
  use_template?: SettingsUseTemplate | null;
  template?: string[] | null;
  use_skeleton?: boolean | null;
  use_provided?: boolean | null;
  stage_wait_duration_secs?: number | null;
  cpus?: number | null;
  mem_gb?: number | null;
  early_return_on_throw?: boolean | null;
  enable_features?: {
    network?: boolean | null;
    gpu_device?: SettingsGpuDevice[] | "ANY" | null;
  } | null;
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
  network: boolean;
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
