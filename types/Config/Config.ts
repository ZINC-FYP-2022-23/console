import type { Settings, SettingsRaw, Stage } from "@types";

/**
 * The grading pipeline configuration of an assignment. It models an assignment configuration YAML.
 */
interface Config {
  /** General configurations across the pipeline. */
  _settings: Settings;
  /** Stages of the pipeline. */
  stages: Stage[];
}

/**
 * Shape of the raw object returned from parsing the YAML string. It will be further
 * transformed to {@link Config}.
 */
export interface ParsedConfig {
  _settings: SettingsRaw;
  [key: string]: any;
}

export default Config;
