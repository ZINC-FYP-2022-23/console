/**
 * @file Utilities for testing GUI Assignment Builder components.
 */

import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { guiBuilderModel, GuiBuilderModel } from "@/store/GuiBuilder";
import { StageConfig } from "@/types/GuiBuilder";
import cloneDeep from "lodash/cloneDeep";

/**
 * Returns a model that contains a single pipeline stage.
 *
 * The config of this stage is the default config as defined in {@link supportedStages}. It has a stage ID of
 * `"stage-0"`, and its node is selected in the pipeline editor.
 *
 * @param name Name of a supported pipeline stage (e.g. `"DiffWithSkeleton"`).
 */
export function getModelWithSingleStage<TName extends keyof StageConfig>(name: TName): GuiBuilderModel {
  const stageId = "stage-0";

  const model = cloneDeep(guiBuilderModel);
  model.config.initialized = true;
  model.config.editingConfig.stageDeps = {
    [stageId]: [],
  };
  model.config.editingConfig.stageData = {
    [stageId]: {
      name,
      label: "",
      kind: supportedStages[name].kind,
      config: supportedStages[name].defaultConfig,
    },
  };
  model.pipelineEditor.nodes = [
    {
      id: stageId,
      position: { x: 117.5, y: -60 },
      data: {
        name,
        label: supportedStages[name].nameInUI,
      },
      type: "stage",
      selected: true,
    },
  ];
  return model;
}
