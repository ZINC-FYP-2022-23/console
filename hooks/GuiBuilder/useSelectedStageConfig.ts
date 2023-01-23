import { useStoreActions, useStoreState } from "@/store/GuiBuilder";

/**
 * Returns the config of the currently selected stage, and a function to update it.
 *
 * The config is `undefined` if no stage is selected. This may possibly happen for a very short
 * time when the user is selecting a new stage.
 */
export default function useSelectedStageConfig<TConfig = any>() {
  const selectedStage = useStoreState((state) => state.pipelineEditor.selectedStage);
  const stageData = useStoreState((state) => state.config.editingConfig.stageData);
  const updateSelectedStage = useStoreActions((actions) => actions.config.updateSelectedStage);

  const config = selectedStage ? (stageData[selectedStage.id].config as TConfig) : undefined;
  const updateFunction = (config: TConfig) => {
    updateSelectedStage({ path: "config", value: config });
  };
  return [config, updateFunction] as const;
}
