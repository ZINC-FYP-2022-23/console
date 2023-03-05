import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { StageConfig } from "@/types/GuiBuilder";

/**
 * Returns the config of the currently selected stage, and a function to update it.
 *
 * @param name An optional stage name (e.g. `"StdioTest"`) that you expect the selected stage to be.
 *
 * @returns An array of two elements:
 * - Config of selected stage. It's `null` if no stage is selected, or if the selected stage's name
 * doesn't match the `name` argument if provided.
 * - A function to update the selected stage. It does nothing if no stage is selected, or if the
 * selected stage's name doesn't match the `name` argument if provided.
 */
export default function useSelectedStageConfig<TName extends keyof StageConfig = any>(name?: TName) {
  const selectedStage = useStoreState((state) => state.pipelineEditor.selectedStage);
  const stageData = useStoreState((state) => state.config.editingConfig.stageData);
  const updateSelectedStage = useStoreActions((actions) => actions.config.updateSelectedStage);

  let config = selectedStage ? (stageData[selectedStage.id].config as StageConfig[TName]) : null;

  // This safety check solves a rare bug where if we change the selected stage from `A` to `B`, the
  // config returned by this hook in `A`'s settings panel returns `B`'s config, shortly before `A`'s
  // settings panel is about to unmount.
  if (name && selectedStage && selectedStage.name !== name) config = null;

  const updateFunction = (config: StageConfig[TName]) => {
    if (selectedStage) {
      if (name && selectedStage.name !== name) return;
      updateSelectedStage({ path: "config", value: config });
    }
  };
  return [config, updateFunction] as const;
}
