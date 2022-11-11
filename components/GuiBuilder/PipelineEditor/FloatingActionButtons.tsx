import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { memo } from "react";

/**
 * Floating action buttons for the pipeline editor.
 */
function FloatingActionButtons() {
  const selectedStage = useStoreState((state) => state.selectedStage);

  return (
    <div className="absolute right-3 top-3 flex gap-4 z-10">
      {selectedStage && <DuplicateStageButton />}
      <FormatPipelineButton />
      <AddStageButton />
    </div>
  );
}

function AddStageButton() {
  const showAddStage = useStoreState((state) => state.layout.showAddStage);
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);

  return (
    <Tooltip
      label={showAddStage ? "Finish Add Stage" : "Add stage"}
      position="bottom"
      transition="fade"
      transitionDuration={200}
    >
      <button
        className={`h-11 w-11 flex items-center justify-center text-white rounded-full drop-shadow ${
          showAddStage ? "bg-green-600" : "bg-cse-700"
        }`}
        onClick={() => toggleAddStage()}
      >
        <FontAwesomeIcon icon={["fas", showAddStage ? "check" : "plus"]} className="text-xl" />
      </button>
    </Tooltip>
  );
}

function FormatPipelineButton() {
  const layoutPipeline = useStoreActions((action) => action.layoutPipeline);

  return (
    <Tooltip label="Format the pipeline" position="bottom" transition="fade" transitionDuration={200}>
      <button
        className="h-11 w-11 flex items-center justify-center bg-blue-100 text-cse-700 rounded-full drop-shadow active:bg-blue-200 transition"
        onClick={() => layoutPipeline()}
      >
        <FontAwesomeIcon icon={["fad", "wand-magic-sparkles"]} className="text-xl" />
      </button>
    </Tooltip>
  );
}

function DuplicateStageButton() {
  const duplicateStage = useStoreActions((action) => action.duplicateStage);

  return (
    <Tooltip label="Duplicate stage" position="bottom" transition="fade" transitionDuration={200}>
      <button
        onClick={() => duplicateStage()}
        className="h-11 w-11 flex items-center justify-center bg-green-600 text-white rounded-full drop-shadow active:bg-green-700 transition"
      >
        <FontAwesomeIcon icon={["far", "copy"]} className="text-xl" />
      </button>
    </Tooltip>
  );
}

export default memo(FloatingActionButtons);
