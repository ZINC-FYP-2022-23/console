/**
 * @file Utilities for testing GUI Assignment Builder components.
 */

import { guiBuilderModel, GuiBuilderModel } from "@/store/GuiBuilder";
import { StageKind } from "@/types/GuiBuilder";
import cloneDeep from "lodash/cloneDeep";

/**
 * Returns a model that contains a single pipeline stage. This stage has a stage ID of `"stage-0"`,
 * and its node is selected in the pipeline editor.
 *
 * @param name Name of that pipeline stage (e.g. `"DiffWithSkeleton"`).
 * @param config Configuration of that pipeline stage.
 */
export function getModelWithSingleStage<TConfig = any>(name: string, config: TConfig): GuiBuilderModel {
  const stageId = "stage-0";

  const model = cloneDeep(guiBuilderModel);
  model.config.initialized = true;
  model.config.editingConfig.stageDeps = {
    [stageId]: [],
  };
  model.config.editingConfig.stageData = {
    [stageId]: {
      name: name,
      label: "",
      kind: StageKind.GRADING, // Doesn't matter so we chose the default value of StageKind
      config: config,
    },
  };
  model.pipelineEditor.nodes = [
    {
      id: stageId,
      position: { x: 117.5, y: -60 },
      data: {
        name: name,
        label: "", // Doesn't matter
      },
      type: "stage",
      selected: true,
    },
  ];
  return model;
}
