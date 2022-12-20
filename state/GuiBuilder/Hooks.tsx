/**
 * @file Hooks for the GUI Assignment Builder page.
 */
import { ActionCreator, createTypedHooks } from "easy-peasy";
import { useEffect } from "react";
import { useKeyPress, useReactFlow } from "reactflow";
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
  const updateSelectedStage = useStoreActions((actions) => actions.updateSelectedStage);

  if (selectedStage === null) {
    throw new Error("No stage is selected while trying to use useSelectedStageConfig()");
  }
  const config = stageData[selectedStage.id].config as TConfig;
  const updateFunction = (config: TConfig) => {
    updateSelectedStage({ path: "config", value: config });
  };
  return [config, updateFunction] as const;
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

/**
 * Handles custom keyboard shortcuts in the Pipeline Editor.
 *  - `Backspace`: Delete selected node or edge.
 */
export function usePipelineEditorHotKeys() {
  const deleteHotKeyPressed = useKeyPress("Backspace");

  const nodes = useStoreState((state) => state.pipelineEditor.nodes);
  const edges = useStoreState((state) => state.pipelineEditor.edges);
  const setModal = useStoreActions((actions) => actions.setModal);
  const deleteStageEdge = useStoreActions((actions) => actions.deleteStageEdge);

  // Backspace: Delete selected node or edge
  useEffect(() => {
    if (deleteHotKeyPressed) {
      const selectedNode = nodes.find((node) => node.selected);
      const selectedEdge = edges.find((edge) => edge.selected);

      if (selectedNode) setModal({ path: "deleteStage", value: true });
      if (selectedEdge) deleteStageEdge(selectedEdge.id);
    }
  }, [deleteHotKeyPressed, nodes, edges, deleteStageEdge, setModal]);
}
