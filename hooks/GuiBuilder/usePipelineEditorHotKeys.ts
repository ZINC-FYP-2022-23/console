import { useHotkeys } from "@mantine/hooks";
import { useStoreActions, useStoreState } from "@store/GuiBuilder";

/**
 * Handles custom keyboard shortcuts in the Pipeline Editor.
 *  - `Backspace`: Delete selected node or edge.
 *  - `Ctrl/Cmd + C`: Copy selected node.
 *  - `Ctrl/Cmd + V`: Paste copied node.
 */
export default function usePipelineEditorHotKeys() {
  const copiedStageId = useStoreState((state) => state.pipelineEditor.copiedStageId);
  const edges = useStoreState((state) => state.pipelineEditor.edges);
  const selectedStage = useStoreState((state) => state.pipelineEditor.selectedStage);
  const deleteStageEdge = useStoreActions((actions) => actions.pipelineEditor.deleteStageEdge);
  const duplicateStage = useStoreActions((actions) => actions.pipelineEditor.duplicateStage);
  const setCopiedStageId = useStoreActions((actions) => actions.pipelineEditor.setCopiedStageId);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

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
