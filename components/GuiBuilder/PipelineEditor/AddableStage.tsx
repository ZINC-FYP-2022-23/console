import { SupportedStage } from "@constants/GuiBuilder/supportedStages";
import { useStoreActions } from "@state/GuiBuilder/Hooks";

interface AddableStageProps {
  stageName: string;
  stageData: SupportedStage;
}

/**
 * Pipeline stage block that can be added to the pipeline editor.
 */
function AddableStage({ stageName, stageData }: AddableStageProps) {
  const setDragging = useStoreActions((action) => action.setDragging);

  return (
    <div className="flex flex-col">
      <div
        className="px-5 py-3 self-start font-medium bg-white border border-gray-400 rounded-md hover:cursor-move"
        draggable
        onDragStart={(event) => {
          setDragging({ stageName, stageData });
          event.dataTransfer.setData("application/reactflow", "stage");
          event.dataTransfer.effectAllowed = "copy";
        }}
        onDragEnd={() => setDragging(undefined)}
      >
        {stageData.nameInUI}
      </div>
      <p className="mt-1 text-xs text-gray-500">{stageData.description}</p>
    </div>
  );
}

export default AddableStage;
