import { useStoreState } from "@state/GuiBuilder/Hooks";
import { ReactFlowProvider } from "reactflow";
import AddStagePanel, { AddStagePanelCollapsed } from "../AddStagePanel";
import PipelineEditor from "../PipelineEditor/PipelineEditor";
import StageSettings from "../StageSettings/StageSettings";

function PipelineStages() {
  const isAddStageCollapsed = useStoreState((state) => state.layout.isAddStageCollapsed);

  return (
    <div className="h-full pt-1 pl-1 flex flex-row gap-3 overflow-y-hidden">
      <div className={`${isAddStageCollapsed ? "flex-1" : "w-4/6"} flex flex-col gap-3`}>
        <div className="h-[45%]">
          <ReactFlowProvider>
            <PipelineEditor />
          </ReactFlowProvider>
        </div>
        <div className="h-[55%]">
          <StageSettings />
        </div>
      </div>
      <div className={`${isAddStageCollapsed ? "" : "w-2/6"} bg-white rounded-md shadow overflow-y-auto`}>
        {isAddStageCollapsed ? <AddStagePanelCollapsed /> : <AddStagePanel />}
      </div>
    </div>
  );
}

export default PipelineStages;
