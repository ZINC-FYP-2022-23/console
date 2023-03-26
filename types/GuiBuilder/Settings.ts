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
  use_generated: boolean;
  stage_wait_duration_secs?: number;
  cpus?: number;
  mem_gb?: number;
  early_return_on_throw: boolean;
  enable_features: {
    network: boolean;
    gpu_device?: SettingsGpuDevice[] | "ANY";
  };
}

/**
 * The shape of `_settings` from an input config YAML (e.g. loaded from database). Its shape is based from
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings the one in the Grader docs}.
 *
 * During parsing of config YAML, the `SettingsRaw` object will be transformed to {@link Settings}.
 */
export interface SettingsRaw {
  lang: string;
  use_template?: SettingsUseTemplate;
  template?: string[];
  use_skeleton?: boolean;
  use_provided?: boolean;
  use_generated?: boolean;
  stage_wait_duration_secs?: number;
  cpus?: number;
  mem_gb?: number;
  early_return_on_throw?: boolean;
  enable_features?: {
    network?: boolean;
    gpu_device?: SettingsGpuDevice[] | "ANY";
  };
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
 * - `FILENAMES` - Take list of files from the `_settings.template` field.
 * - `PATH` - Take from the list of files uploaded by the TA on what files the student should submit.
 */
export type SettingsUseTemplate = "FILENAMES" | "PATH";

/**
 * Accepted vendors for the `_settings.enable_features.gpu_device` field.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-enable-features-gpu}
 */
export type SettingsGpuDevice = "NVIDIA" | "AMD" | "INTEL";

export default Settings;
