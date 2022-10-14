import { SupportedStage } from "@constants/Config/supportedStages";
import { useStoreActions } from "@state/GuiBuilder/Hooks";

/**
 * Pipeline stage block that can be added to the pipeline editor.
 */
function AddableStage({ stage }: { stage: SupportedStage }) {
  const setDragging = useStoreActions((action) => action.setDragging);

  return (
    <div className="flex flex-col">
      <div
        className="px-5 py-3 self-start font-medium bg-white border border-gray-400 rounded-md hover:cursor-move"
        draggable
        onDragStart={(event) => {
          setDragging(stage);
          // TODO: Use custom node type instead of `"default"`
          event.dataTransfer.setData("application/reactflow", "default");
          event.dataTransfer.effectAllowed = "copy";
        }}
        onDragEnd={() => setDragging(undefined)}
      >
        {stage.label}
      </div>
      <p className="mt-1 text-xs text-gray-500">{stage.description}</p>
    </div>
  );
}

export default AddableStage;
