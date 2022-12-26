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
 * How stages depends on each other. The key is the UUID of a stage, and the value is an array of
 * UUIDs of other stages that this stage depends on.
 *
 * It's an adjacency list that represents a directed acyclic graph (DAG) of how stages depends on each other.
 */
export interface StageDependencyMap {
  [id: string]: string[];
}

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

/** Configuration of each stage. The key is the stage name and the value is the configuration of the stage. */
export interface StageConfig {
  Compile: Compile;
  DiffWithSkeleton: DiffWithSkeleton;
  FileStructureValidation: FileStructureValidation;
  Score: Score;
  StdioTest: StdioTest;
}

export interface Compile {
  input: string[];
  output?: string;
  flags?: string[];
  additional_packages?: string[];
}

export interface DiffWithSkeleton {
  exclude_from_provided: boolean;
}

export interface FileStructureValidation {
  ignore_in_submission?: string[];
}

/**
 * The shape of `Score` stage's config returned by the backend.
 *
 * Reference: https://docs.zinc.ust.dev/user/pipeline/local/Score.html#config
 */
export interface ScoreRaw {
  normalizedTo?: number;
  minScore?: number;
  maxScore?: number;
}

export interface Score {
  normalizedTo: string;
  minScore: string;
  maxScore: string;
}

export interface StdioTest {
  testCases: any[]; // TODO(Anson): Define type
}

export default Stage;
