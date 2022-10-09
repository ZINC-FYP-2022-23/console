/**
 * General configurations across the pipeline. Corresponds to the `_settings` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings}
 */
interface Settings {
  lang: SettingsLang;
  use_template?: SettingsUseTemplate;
  template?: string[];
  use_skeleton: boolean;
  use_provided: boolean;
  // NOTE: `number | string` = Either a number or a numerical string (e.g. `"60"`)
  stage_wait_duration_secs: number | string;
  cpus: number | string;
  mem_gb: number | string;
  early_return_on_throw: boolean;
  enable_features: SettingsFeatures;
}

/**
 * Class representation of the `_settings.lang` field.
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
