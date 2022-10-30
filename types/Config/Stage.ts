/** A pipeline stage in the assignment configuration. */
interface Stage {
  /** The stage's key in the config YAML (e.g. `"stdioTest"`, `"compile:main"`). */
  key: string;
  /** Stage name (e.g. `"StdioTest"`, `"Compile"`). */
  readonly name: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Configuration of the stage. */
  config: any;
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
export type StageDataMap = { [id: string]: Stage };

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

export interface Compile extends Stage {
  config: {
    input: string[];
    output?: string;
    flags?: string[];
    additional_packages?: string[];
  };
}

export interface DiffWithSkeleton extends Stage {
  config: {
    exclude_from_provided: boolean;
  };
}

export interface FileStructureValidation extends Stage {
  config: {
    ignore_in_submission?: string[];
  };
}

export interface Score extends Stage {
  config: {
    normalizedTo?: number;
    minScore?: number;
    maxScore?: number;
  };
}

export interface StdioTest extends Stage {
  // TODO
  config: any;
}

export default Stage;
