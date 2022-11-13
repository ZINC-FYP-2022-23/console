import Button from "@components/Button";
import { useStoreState } from "@state/GuiBuilder/Hooks";
import { configToYaml } from "@utils/Config";
import { ReactFlowProvider } from "reactflow";
import PipelineEditor from "../PipelineEditor/PipelineEditor";
import AddStagePanel from "../Settings/AddStagePanel";
import StageSettings from "../StageSettings/StageSettings";

function PipelineStages() {
  const editingConfig = useStoreState((state) => state.editingConfig);

  return (
    <div className="h-full pt-1 pl-1 flex flex-row gap-3 overflow-y-hidden">
      <div className="w-4/6 flex flex-col gap-3">
        <div className="h-[45%]">
          <ReactFlowProvider>
            <PipelineEditor />
          </ReactFlowProvider>
        </div>
        <div className="h-[55%] bg-white rounded-md shadow">
          <StageSettings />
        </div>
      </div>
      <div className="w-2/6 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button className="bg-violet-500 text-white hover:bg-violet-600" onClick={() => console.log(editingConfig)}>
            Debug: Log Config
          </Button>
          <Button
            className="bg-violet-500 text-white hover:bg-violet-600"
            onClick={() => console.log(configToYaml(editingConfig))}
          >
            Debug: Log YAML
          </Button>
        </div>
        <div className="flex-1 bg-white rounded-md shadow overflow-y-auto">
          <AddStagePanel />
        </div>
      </div>
    </div>
  );
}

export default PipelineStages;
