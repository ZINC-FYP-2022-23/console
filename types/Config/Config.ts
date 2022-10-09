import { type Settings, type Stage } from "types";

/**
 * An assignment configuration.
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
  _settings: Omit<Settings, "lang"> & { lang: string };
  [key: string]: any;
}

export default Config;
