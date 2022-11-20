/**
 * @file Hooks for the GUI Assignment Builder page.
 */
import { ActionCreator, createTypedHooks } from "easy-peasy";
import { useEffect } from "react";
import { useReactFlow } from "reactflow";
import { GuiBuilderStoreModel } from "./Store";

/**
 * Typed Easy Peasy hooks ({@link https://easy-peasy.vercel.app/docs/tutorials/typescript.html#typing-the-hooks Docs}).
 */
const typedHooks = createTypedHooks<GuiBuilderStoreModel>();
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;

/**
 * Returns the config of the currently selected stage, and a function to update it.
 * @remarks Do **not** use this hook if there are no stages selected.
 */
export function useSelectedStageConfig<TConfig = any>() {
  const selectedStage = useStoreState((state) => state.selectedStage);
  const stageData = useStoreState((state) => state.editingConfig.stageData);
  const updateSelectedStageConfig: ActionCreator<TConfig> = useStoreActions(
    (actions) => actions.updateSelectedStageConfig,
  );

  if (selectedStage === null) {
    throw new Error("No stage is selected while trying to use useSelectedStageConfig()");
  }
  const config = stageData[selectedStage.id].config as TConfig;
  return [config, updateSelectedStageConfig] as const;
}

/**
 * Fit the React Flow view to the nodes on the pane whenever `state.pipelineEditor.shouldFitView` is true.
 */
export function useReactFlowFitView() {
  const { fitView } = useReactFlow();
  const shouldFitView = useStoreState((state) => state.pipelineEditor.shouldFitView);
  const setShouldFitView = useStoreActions((actions) => actions.setShouldFitView);

  useEffect(() => {
    if (shouldFitView) {
      fitView({ padding: 0.2, duration: 300 });
      setShouldFitView(false);
    }
  }, [fitView, shouldFitView, setShouldFitView]);
}
