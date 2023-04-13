import { useStoreActions } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { memo } from "react";

/**
 * Floating action buttons for the pipeline editor.
 */
function FloatingActionButtons() {
  return (
    <div className="absolute right-3 top-3 flex gap-4 z-10">
      <FormatPipelineButton />
    </div>
  );
}

function FormatPipelineButton() {
  const layoutPipeline = useStoreActions((action) => action.pipelineEditor.layoutPipeline);

  return (
    <Tooltip label="Layout the graph nicely" position="bottom" transition="fade" transitionDuration={200}>
      <button
        className="h-11 w-11 flex items-center justify-center bg-cse-600 text-white rounded-full drop-shadow hover:bg-cse-700 transition"
        onClick={() => layoutPipeline()}
      >
        <FontAwesomeIcon icon={["fad", "wand-magic-sparkles"]} className="text-xl" />
      </button>
    </Tooltip>
  );
}

export default memo(FloatingActionButtons);
