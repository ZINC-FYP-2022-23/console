/**
 * @file Types for the pipeline editor in GUI Assignment Builder.
 */

/**
 * Data stored by a stage node.
 */
export type StageNodeData = {
  /** Stage name (e.g. `"StdioTest"`, `"Compile"`). */
  readonly name: string;
  /** Label of the stage to be shown. */
  readonly label: string;
};
