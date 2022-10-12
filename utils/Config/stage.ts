/**
 * @file Utilities for the `Stage` type.
 */

import supportedStages from "@constants/Config/supportedStages";
import { Stage, StageKind } from "@types";

/**
 * Gets the type of the stage, such as `"StdioTest"`, `"Compile"`, etc.
 * @param id The stage id (e.g. `"compile:main"`)
 */
export function getStageType(id: string) {
  const name = id.split(":")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Parses stages from a config YAML.
 * @param stages Object representation of the stages to be parsed.
 */
export function parseStages(stages: { [key: string]: any }): Stage[] {
  return Object.entries(stages).map(([id, config]) => {
    const stageName = getStageType(id);
    const stage = supportedStages.find((stage) => stage.name === stageName);
    if (stage === undefined) {
      console.warn(`Stage ${stageName} is not supported by GUI Assignment Builder (parsing '${id}').`);
    }
    return {
      id,
      name: stageName,
      kind: stage?.kind ?? StageKind.GRADING,
      config,
    };
  });
}

/**
 * Converts to an object representation of the stages in the config YAML.
 */
export function stagesToYamlObj(stages: Stage[]): { [key: string]: any } {
  const _stages = {};
  stages.forEach((stage) => (_stages[stage.id] = stage.config));
  return _stages;
}
