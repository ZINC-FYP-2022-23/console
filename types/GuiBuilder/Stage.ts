import { DirectedGraph } from "./Graph";

/** A pipeline stage in the assignment configuration. */
interface Stage<TConfig = any> {
  /** Stage name (e.g. `"StdioTest"`, `"Compile"`). */
  readonly name: string;
  /**
   * Label to help users differentiate multiple stages of the same name. It is an empty string by default.
   *
   * When serializing the config to YAML, this field will be treated as the
   * {@link https://docs.zinc.ust.dev/user/model/Config.html#advanced-usage-multiple-stages-of-same-type Stage ID}
   * if its value is a non-empty string.
   */
  label: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Configuration of the stage. */
  config: TConfig;
}

/**
 * A {@link DirectedGraph} that describes how stages depends on each other. The key is the UUID of a stage,
 * and the value is an array of UUIDs of other stages that this stage depends on.
 *
 * Transposing this graph gives the execution order of stages.
 *
 * @example
 * const stageDeps: StageDependencyGraph = {
 *   "A": [],
 *   "B": ["A"],  // B depends on A, i.e. B should be executed after A
 * }; // A <- B
 */
export type StageDependencyGraph = DirectedGraph;

/** Mapping of a stage's UUID to its data. */
export type StageDataMap = {
  [id: string]: Stage;
};

/**
 * Classification of a stage. Corresponds to the `PipelineStage.Kind` enum in the "grader" repo.
 *
 * The grader relies on stage kind to automatically re-arrange pipeline stages. The stage ordering
 * specified in the config YAML does not necessarily equal to the actual order of execution.
 */
export enum StageKind {
  /** A stage which cannot be moved within a pipeline. It must remain in the same index as when it was created. */
  CONSTANT = "CONSTANT",
  /** Pre-grading stage that's performed globally. */
  PRE_GLOBAL = "PRE_GLOBAL",
  /** Pre-grading stage that's performed locally. */
  PRE_LOCAL = "PRE_LOCAL",
  /** Grading stage (default value). */
  GRADING = "GRADING",
  /** Post-grading stage. */
  POST = "POST",
}

export default Stage;
