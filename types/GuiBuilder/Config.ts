import { Settings, SettingsRaw, StageDataMap, StageDependencyGraph } from "@/types/GuiBuilder";

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
  stageDeps: StageDependencyGraph;
  /** A map of stage UUID to stage data. */
  stageData: StageDataMap;
}

/**
 * Shape of the raw object returned from parsing the YAML string. It will be further
 * transformed to {@link Config}.
 *
 * We model all nullable fields in the YAML string as union with `undefined` instead of union with `null`.
 */
export interface ConfigRaw {
  _settings: SettingsRaw;
  /** Stage IDs (e.g. `"stdioTest:hidden"`). */
  [stageId: string]: any;
}

export default Config;
