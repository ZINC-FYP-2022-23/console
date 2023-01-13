import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { useEffect } from "react";
import { useReactFlow } from "reactflow";

/**
 * Fit the React Flow view to the nodes on the pane whenever `state.pipelineEditor.shouldFitView` is true.
 */
export default function useReactFlowFitView() {
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
