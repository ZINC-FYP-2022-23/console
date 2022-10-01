import Settings from "./Settings";
import { load } from "js-yaml";

/**
 * An assignment configuration.
 */
class Config {
  /**
   * General configurations across the pipeline.
   */
  _settings: Settings;

  /**
   * Stages of the pipeline.
   */
  // TODO
  stages: any;

  constructor(settings: ParsedConfig["_settings"], stages: any) {
    this._settings = new Settings(settings);
    this.stages = stages;
  }

  /**
   * Parse a config YAML into a `Config` instance.
   * @param yaml The config YAML. Assumes that it has already been validated by the grader.
   */
  static parseYaml(yaml: string): Config {
    const { _settings, ...stages } = load(yaml) as ParsedConfig;
    return new Config(_settings, stages);
  }
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
