/**
 * @file Utilities for the `Stage` type.
 */

import supportedStages from "@constants/Config/supportedStages";
import { StageChildren, StageDataMap, StageDependency, StageKind } from "@types";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";

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
export function parseStages(stages: { [key: string]: any }): [StageDependency[], StageDataMap] {
  const stageDeps: StageDependency[] = [];
  const stageData: StageDataMap = {};
  let prevStage: string | null = null;

  Object.entries(stages).forEach(([key, config]) => {
    const stageName = getStageType(key);
    const stage = supportedStages.find((stage) => stage.name === stageName);
    if (stage === undefined) {
      console.warn(`Stage ${stageName} is not supported by GUI Assignment Builder (parsing '${key}').`);
    }
    const stageId = uuidv4();

    // Order stages in the form of a linked list, so that a stage only depends on 1 other stage.
    stageDeps.push({
      id: stageId,
      dependsOn: prevStage === null ? null : [prevStage],
    });
    prevStage = stageId;

    stageData[stageId] = {
      key,
      name: stageName,
      kind: stage?.kind ?? StageKind.GRADING,
      config,
    };
  });

  return [stageDeps, stageData];
}

/**
 * Gets a transposed (reversed) directed graph of the stage dependency graph.
 * @param stageDeps The DAG of how stages depend on each other. This array is not modified.
 * @returns An array of objects specifying what stages shall be executed after a stage.
 * @example
 * const stageDeps = [{ id: "1", dependsOn: ["2"] }, { id: "2", dependsOn: ["3"] }, { id: "3", dependsOn: null }]; // 3 <- 2 <- 1
 * const transposed = transposeStages(stageDeps); // 3 -> 2 -> 1
 * console.log(transposed); // [{ id: "1", children: [] }, { id: "2", children: ["1"] }, { id: "3", children: ["2"] }]
 */
export function transposeStages(stageDeps: StageDependency[]): StageChildren[] {
  const stageChildren: StageChildren[] = [];
  stageDeps.forEach((stageDep) => {
    const stage = stageChildren.find((stage) => stage.id === stageDep.id);
    if (!stage) {
      stageChildren.push({ id: stageDep.id, children: [] });
    }
    if (stageDep.dependsOn) {
      stageDep.dependsOn.forEach((id) => {
        const child = stageChildren.find((child) => child.id === id);
        if (child) {
          child.children.push(stageDep.id);
        } else {
          stageChildren.push({ id, children: [stageDep.id] });
        }
      });
    }
  });
  return stageChildren;
}

/**
 * Converts to an object representation of the stages in the config YAML.
 * @param stageDeps The DAG of how stages depend on each other. Assumes that it has the shape of a **linked list**.
 */
export function stagesToYamlObj(stageDeps: StageDependency[], stageData: StageDataMap): { [key: string]: any } {
  // Currently the grader executes each stage sequentially. Hence, `stageDeps` is a linked list.
  // By transposing the graph, we are "reversing" the linked list to get the order of execution.
  const stageExecutionOrder = transposeStages(stageDeps);

  const firstStage = stageDeps.find((stageDep) => stageDep.dependsOn === null);
  if (!firstStage) {
    console.error("Failed to locate the first stage in the stage dependency graph.");
    return {};
  }

  const stages = {};
  let currentStage = stageExecutionOrder.find((stage) => stage.id === firstStage.id)!;
  while (currentStage) {
    const currentStageData = stageData[currentStage.id];
    stages[currentStageData.key] = currentStageData.config;

    const numChildren = currentStage.children.length;
    if (numChildren === 0) {
      break;
    }
    currentStage = stageExecutionOrder.find((stage) => stage.id === currentStage.children[0])!;
  }

  return stages;
}

/**
 * Deep compares two stage dependency graphs. `deps1` and `deps2` can be linked list or branched DAGs.
 */
export function isStageDependencyEqual(deps1: StageDependency[], deps2: StageDependency[]) {
  let isDepsEqual = deps1.length === deps2.length;
  if (isDepsEqual) {
    for (const dep of deps1) {
      const otherDep = deps2.find((otherDep) => otherDep.id === dep.id);
      if (!otherDep) {
        isDepsEqual = false;
        break;
      } else {
        dep.dependsOn = dep.dependsOn ? [...dep.dependsOn].sort() : null;
        otherDep.dependsOn = otherDep.dependsOn ? [...otherDep.dependsOn].sort() : null;
        isDepsEqual = isEqual(dep.dependsOn, otherDep.dependsOn);
      }
    }
  }

  return isDepsEqual;
}
