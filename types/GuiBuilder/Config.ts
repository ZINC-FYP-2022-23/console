import type { Settings, SettingsRaw, StageDataMap, StageDependencyMap } from "@/types";

/**
 * The grading pipeline configuration of an assignment. It models an assignment configuration YAML.
 */
interface Config {
  /** General configurations across the pipeline. */
  _settings: Settings;
  /**
   * How each stage is dependent on other stages. We can build a directed acyclic graph (DAG) from this array
   * that shows stages dependencies.
   */
  stageDeps: StageDependencyMap;
  /** A map of stage UUID to stage data. */
  stageData: StageDataMap;
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
