/**
 * @file Types for the pipeline editor in GUI Assignment Builder.
 */

import { Node } from "reactflow";

/**
 * Data stored by a stage node.
 */
export type StageNodeData = {
  /** Stage name (e.g. `"StdioTest"`, `"Compile"`). */
  readonly name: string;
  /** Label of the stage to be shown. */
  readonly label: string;
};

export type StageNode = Node<StageNodeData>;
