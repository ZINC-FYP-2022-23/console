import { useStoreActions } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";
import { useState } from "react";
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from "reactflow";
import "reactflow/dist/style.css";

/**
 * A custom React Flow edge that connects two stages in the grading pipeline.
 */
function StageEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd }: EdgeProps) {
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const deleteStageEdge = useStoreActions((actions) => actions.pipelineEditor.deleteStageEdge);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* This transparent `path` creates a "padding" around the stage edge for hovering. */}
      <path
        className="stroke-[50px] stroke-transparent fill-transparent"
        d={edgePath}
        onMouseEnter={() => setShowDeleteBtn(true)}
        onMouseLeave={() => setShowDeleteBtn(false)}
      />
      <path id={id} className="react-flow__edge-path !stroke-[3px]" d={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteStageEdge(id);
          }}
          onMouseEnter={() => setShowDeleteBtn(true)}
          onMouseLeave={() => setShowDeleteBtn(false)}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={clsx(
            "pointer-events-auto w-5 h-5 absolute flex items-center justify-center bg-red-500 text-white text-sm cursor-pointer rounded-full hover:bg-red-700 transition-[background-color,opacity]",
            showDeleteBtn ? "opacity-100" : "opacity-0",
          )}
          data-cy="delete-stage-edge"
        >
          <FontAwesomeIcon className="w-3 !h-3" icon={["fas", "xmark"]} />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

export default StageEdge;
