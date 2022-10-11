/**
 * @file Utilities for the `Stage` type.
 */

import type { Stage } from "@types";

/**
 * Gets the type of the stage, such as `"StdioTest"`, `"Compile"`, etc.
 */
export function getStageType(stage: Stage) {
  const name = stage.id.split(":")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
