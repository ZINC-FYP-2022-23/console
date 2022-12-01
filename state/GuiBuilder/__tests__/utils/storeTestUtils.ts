import { defaultSettings } from "@constants/Config/defaults";
import supportedStages from "@constants/Config/supportedStages";
import { StageKind } from "@types";
import cloneDeep from "lodash/cloneDeep";
import { GuiBuilderStoreModel, initialModel } from "../../Store";

/**
 * Gets an example store model with 3 stages.
 */
export function getThreeStageModel(): GuiBuilderStoreModel {
  const model = cloneDeep(initialModel);
  return {
    ...model,
    editingConfig: {
      _settings: defaultSettings,
      stageDeps: {
        "stage-0": [],
        "stage-1": ["stage-0"],
        "stage-2": ["stage-1"],
      },
      stageData: {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {
            exclude_from_provided: true,
          },
        },
        "stage-1": {
          name: "FileStructureValidation",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {
            ignore_in_submission: ["*.out"],
          },
        },
        "stage-2": {
          name: "Compile",
          label: "all",
          kind: StageKind.PRE_LOCAL,
          config: {
            input: ["*.cpp"],
            output: "a.out",
          },
        },
      },
    },
    pipelineEditor: {
      ...model.pipelineEditor,
      dragging: {
        stageName: "Score",
        stageData: supportedStages.Score,
      },
      nodes: [
        {
          id: "stage-0",
          position: { x: 117.5, y: -60 },
          data: { name: "DiffWithSkeleton", label: "Diff With Skeleton" },
          type: "stage",
        },
        {
          id: "stage-1",
          position: { x: 352.5, y: -60 },
          data: { name: "FileStructureValidation", label: "File Structure Validation" },
          type: "stage",
        },
        {
          id: "stage-2",
          position: { x: 587.5, y: -60 },
          data: { name: "Compile", label: "Compile" },
          type: "stage",
        },
      ],
      edges: [
        { id: "reactflow__edge-stage-0-stage-1", source: "stage-0", target: "stage-1", type: "stage" },
        { id: "reactflow__edge-stage-1-stage-2", source: "stage-1", target: "stage-2", type: "stage" },
      ],
    },
  };
}
