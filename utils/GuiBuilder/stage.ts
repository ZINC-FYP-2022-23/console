/**
 * @file Utilities for the `Stage` type.
 */

import supportedStages, { SupportedStage } from "@/constants/GuiBuilder/supportedStages";
import { StageDataMap, StageDependencyMap, StageKind } from "@/types";
import { dump, load } from "js-yaml";
import camelCase from "lodash/camelCase";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";

/**
 * @param id The stage id (e.g. `"stdioTest:hidden"`)
 * @example
 * const output = getStageNameAndLabel("stdioTest:hidden");
 * console.log(output); // ["StdioTest", "hidden"]
 */
export function getStageNameAndLabel(id: string) {
  const splitOutput = id.split(":");
  const name = splitOutput[0].charAt(0).toUpperCase() + splitOutput[0].slice(1);
  const label = splitOutput.length > 1 ? splitOutput[1] : "";
  return [name, label] as const;
}

/**
 * Parses stages from a config YAML.
 * @param stages Object representation of the stages to be parsed.
 */
export function parseStages(stages: { [key: string]: any }): [StageDependencyMap, StageDataMap] {
  const stageDeps: StageDependencyMap = {};
  const stageData: StageDataMap = {};
  let prevStage: string | null = null;

  Object.entries(stages).forEach(([key, rawConfig]) => {
    const [stageName, stageLabel] = getStageNameAndLabel(key);
    const stage: SupportedStage | undefined = supportedStages[stageName];
    if (stage === undefined) {
      console.warn(`Stage ${stageName} is not supported by GUI Assignment Builder (parsing '${key}').`);
    }
    const stageId = uuidv4();

    // Order stages in the form of a linked list, so that a stage only depends on 1 other stage.
    stageDeps[stageId] = prevStage === null ? [] : [prevStage];
    stageData[stageId] = {
      name: stageName,
      label: stageLabel,
      kind: stage?.kind ?? StageKind.GRADING,
      config: stage === undefined ? dump(rawConfig) : stage?.configFromRaw?.(rawConfig) ?? rawConfig,
    };
    prevStage = stageId;
  });

  return [stageDeps, stageData];
}

/**
 * Gets a transposed (reversed) stage dependency graph. The transposed graph is actually a DAG that
 * shows the execution order of stages.
 * @param stageDeps The adjacency list of the stage dependency graph. This object is not modified.
 * @returns An adjacency list of the transposed stage dependency graph.
 * @example
 * const stageDeps = { "A": ["B"], "B": ["C"], "C": [] }; // C <- B <- A (Dependency graph)
 * const transposed = transposeStageDeps(stageDeps); // C -> B -> A (Execution order)
 * console.log(transposed); // { A: [], B: ["A"], C: ["B"] }
 */
export function transposeStageDeps(stageDeps: StageDependencyMap): { [id: string]: string[] } {
  /** The key is UUID of a stage, and the value is UUIDs of other stages that are children of it. */
  const stageChildren: { [id: string]: string[] } = {};

  Object.entries(stageDeps).forEach(([id, dependsOn]) => {
    if (!(id in stageChildren)) {
      stageChildren[id] = [];
    }
    dependsOn.forEach((depId) => {
      if (depId in stageChildren) {
        stageChildren[depId].push(id);
      } else {
        stageChildren[depId] = [id];
      }
    });
  });

  return stageChildren;
}

/**
 * Deletes a stage from the stage dependency graph.
 * @param target The UUID of the stage to be deleted.
 * @param stageDeps The adjacency list of the stage dependency graph. This object will NOT be mutated.
 */
export function deleteStageFromDeps(target: string, stageDeps: StageDependencyMap): StageDependencyMap {
  const _stageDeps = cloneDeep(stageDeps);

  if (!(target in stageDeps)) {
    console.warn(`Cannot delete stage of ID "${target}" because it does not exist.`);
    return _stageDeps;
  }

  // Delete the target stage
  delete _stageDeps[target];

  // Delete all edges pointing to the target stage
  Object.entries(_stageDeps).forEach(([id, dependsOn]) => {
    _stageDeps[id] = dependsOn.filter((depId) => depId !== target);
  });

  return _stageDeps;
}

/**
 * Converts to an object representation of the stages in the config YAML.
 * @param stageDeps Assume that the stage dependency graph has the shape of a **linked list**.
 */
export function stagesToYamlObj(stageDeps: StageDependencyMap, stageData: StageDataMap): { [key: string]: any } {
  const stageDataTidied = configsToConfigsRaw(generateStageLabels(stageData));

  // Currently the grader executes each stage sequentially. Hence, `stageDeps` is a linked list.
  // By transposing the graph, we are "reversing" the linked list to get the order of execution.
  const executionOrderGraph = transposeStageDeps(stageDeps);

  const firstStagePair = Object.entries(stageDeps).find(([, dependsOn]) => dependsOn.length === 0);
  if (!firstStagePair) {
    console.error("Failed to locate the first stage in the stage dependency graph.");
    return {};
  }
  const [firstStageId] = firstStagePair;

  // Traverse the linked list
  const output = {};
  let currentStageId = firstStageId;
  while (currentStageId) {
    const currentStageData = stageDataTidied[currentStageId];

    let key = camelCase(currentStageData.name);
    if (currentStageData.label !== "") {
      key += `:${currentStageData.label}`;
    }
    output[key] = currentStageData.config;

    const numChildren = executionOrderGraph[currentStageId].length;
    if (numChildren === 0) {
      break;
    }
    currentStageId = executionOrderGraph[currentStageId][0];
  }

  return output;
}

/**
 * Deep compares two stage dependency graphs. `deps1` and `deps2` can be linked list or branched DAGs.
 */
export function isStageDependencyEqual(deps1: StageDependencyMap, deps2: StageDependencyMap) {
  const _deps1 = cloneDeep(deps1);
  const _deps2 = cloneDeep(deps2);
  for (const [id, dependsOn] of Object.entries(_deps1)) {
    _deps1[id] = [...dependsOn].sort();
  }
  for (const [id, dependsOn] of Object.entries(_deps2)) {
    _deps2[id] = [...dependsOn].sort();
  }
  return isEqual(_deps1, _deps2);
}

/**
 * Generates a random label if multiple stages of the same name have empty labels.
 * @param stageData This object will NOT be mutated.
 */
export function generateStageLabels(stageData: StageDataMap): StageDataMap {
  const s = cloneDeep(stageData);

  // Key is stage name, value is number of empty labels
  const emptyLabelsCount: Record<string, number> = Object.values(s).reduce((acc, stage) => {
    if (stage.label === "") {
      acc[stage.name] = stage.name in acc ? acc[stage.name] + 1 : 1;
    }
    return acc;
  }, {});

  Object.values(s).forEach((stage) => {
    if (stage.label === "" && emptyLabelsCount[stage.name] > 1) {
      // Random string of length 6 with characters [a-z0-9]
      stage.label = Math.random().toString(36).slice(2, 8);
    }
  });

  return s;
}

/**
 * Tidies up the config in each stage's data, such that its shape is compliant to the format expected by
 * the Grader.
 *
 * How the tidying up is done is defined in {@link SupportedStage.configToRaw}.
 *
 * @param stageData The stage data to be tidied up. This object will NOT be mutated.
 * @returns A cloned copy of the `stageData` argument that's tidied up.
 */
export function configsToConfigsRaw(stageData: StageDataMap): StageDataMap {
  const s = cloneDeep(stageData);
  Object.values(s).forEach((stage) => {
    const stageMetadata: SupportedStage | undefined = supportedStages[stage.name];
    if (stageMetadata) {
      stage.config = stageMetadata.configToRaw?.(stage.config) ?? stage.config;
    } else {
      stage.config = load(stage.config); // Parse the raw YAML for unsupported stages
    }
  });
  return s;
}
