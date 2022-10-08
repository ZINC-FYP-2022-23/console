import { dump, load } from "js-yaml";
import Settings from "./Settings";
import Stage from "./Stage";

/**
 * An assignment configuration.
 */
class Config {
  constructor(
    /** General configurations across the pipeline. */
    public _settings: Settings,
    /** Stages of the pipeline. */
    public stages: Stage[],
  ) {}

  /**
   * Creates a `Config` instance from parsing the configuration YAML.
   * @param yaml It's assumed that the YAML has already been validated by the grader.
   */
  static fromYaml(yaml: string): Config {
    const { _settings, ...stagesRaw } = load(yaml) as ParsedConfig;
    const settings = Settings.fromYamlObject(_settings);
    const stages = Object.entries(stagesRaw).map(([id, config]) => new Stage(id, config));
    return new Config(settings, stages);
  }

  /**
   * De-serializes to a YAML string.
   */
  toYaml() {
    const _settings = this._settings.toYamlObject();
    const stages = {};
    this.stages.forEach((stage) => (stages[stage.id] = stage.config));
    return dump({ _settings, ...stages });
  }

  /**
   * Creates an empty `Config` instance.
   */
  static empty(): Config {
    return new Config(new Settings(), []);
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