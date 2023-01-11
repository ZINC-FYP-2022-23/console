/**
 * @file Hooks for the GUI Assignment Builder page.
 */
import { useHotkeys } from "@mantine/hooks";
import { createTypedHooks } from "easy-peasy";
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
 *
 * The config is `undefined` if no stage is selected. This may possibly happen for a very short
 * time when the user is selecting a new stage.
 */
export function useSelectedStageConfig<TConfig = any>() {
  const selectedStage = useStoreState((state) => state.selectedStage);
  const stageData = useStoreState((state) => state.editingConfig.stageData);
  const updateSelectedStage = useStoreActions((actions) => actions.updateSelectedStage);

  const config = selectedStage ? (stageData[selectedStage.id].config as TConfig) : undefined;
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
 *  - `Ctrl/Cmd + C`: Copy selected node.
 *  - `Ctrl/Cmd + V`: Paste copied node.
 */
export function usePipelineEditorHotKeys() {
  const copiedStageId = useStoreState((state) => state.pipelineEditor.copiedStageId);
  const edges = useStoreState((state) => state.pipelineEditor.edges);
  const selectedStage = useStoreState((state) => state.selectedStage);
  const deleteStageEdge = useStoreActions((actions) => actions.deleteStageEdge);
  const duplicateStage = useStoreActions((actions) => actions.duplicateStage);
  const setCopiedStageId = useStoreActions((actions) => actions.setCopiedStageId);
  const setModal = useStoreActions((actions) => actions.setModal);

  useHotkeys([
    [
      "Backspace", // Backspace: Delete selected node or edge
      () => {
        const selectedEdge = edges.find((edge) => edge.selected);
        if (selectedStage) setModal({ path: "deleteStage", value: true });
        if (selectedEdge) deleteStageEdge(selectedEdge.id);
      },
    ],
    [
      "mod+C", // Ctrl/Cmd + C: Copy selected node
      () => {
        // Fix "Ctrl+C" not working when copying selected text in window
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          return;
        }
        if (selectedStage) {
          setCopiedStageId(selectedStage.id);
        }
      },
    ],
    [
      "mod+V", // Ctrl/Cmd + V: Paste copied node
      () => {
        if (copiedStageId) {
          duplicateStage(copiedStageId);
          setCopiedStageId(undefined);
        }
      },
    ],
  ]);
}
