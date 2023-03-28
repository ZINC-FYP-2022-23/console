import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { guiBuilderModel } from "@/store/GuiBuilder";
import { StageKind, StdioTest, Valgrind } from "@/types/GuiBuilder";
import cloneDeep from "lodash/cloneDeep";

/**
 * Returns a model that contain a `StdioTest` stage (which is selected) and optionally a `Valgrind` stage.
 * @param stdioTest The config of `StdioTest`. It defaults to a default `StdioTest` config.
 * @param valgrind The config of `Valgrind`. If it is undefined, then the model will not contain
 * a `Valgrind` stage.
 */
export function getModelWithStdioTestStage(stdioTest?: StdioTest, valgrind?: Valgrind) {
  const stdioTestStageId = "stage-0";
  const valgrindStageId = "stage-1";

  const model = cloneDeep(guiBuilderModel);
  model.config.initialized = true;
  model.config.editingConfig.stageDeps = {
    [stdioTestStageId]: [],
    ...(valgrind && { [valgrindStageId]: [stdioTestStageId] }),
  };
  model.config.editingConfig.stageData = {
    [stdioTestStageId]: {
      name: "StdioTest",
      label: "",
      kind: StageKind.GRADING,
      config: stdioTest ?? supportedStages.StdioTest.defaultConfig,
    },
    ...(valgrind && {
      [valgrindStageId]: {
        name: "Valgrind",
        label: "",
        kind: StageKind.GRADING,
        config: valgrind,
      },
    }),
  };
  model.pipelineEditor.nodes = [
    {
      id: stdioTestStageId,
      position: { x: 117.5, y: -60 },
      data: { name: "StdioTest", label: "Standard I/O Test" },
      type: "stage",
      selected: true,
    },
  ];
  if (valgrind) {
    model.pipelineEditor.nodes.push({
      id: valgrindStageId,
      position: { x: 352.5, y: -60 },
      data: { name: "Valgrind", label: "Valgrind" },
      type: "stage",
    });
  }

  return model;
}
