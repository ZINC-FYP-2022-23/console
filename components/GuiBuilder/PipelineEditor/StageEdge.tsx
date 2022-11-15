import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { useState } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const deleteBtnSize = 20;

/**
 * A custom React Flow edge that connects two stages in the grading pipeline.
 */
function StageEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd }: EdgeProps) {
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const deleteStageEdge = useStoreActions((actions) => actions.deleteStageEdge);

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
      {/* The transparent `path` below creates a "padding" around the stage edge to make it easier to click. */}
      <path
        className="stroke-[50px] stroke-transparent fill-transparent"
        d={edgePath}
        onMouseEnter={() => setShowDeleteBtn(true)}
        onMouseLeave={() => setShowDeleteBtn(false)}
      />
      <path id={id} className="react-flow__edge-path !stroke-[3px]" d={edgePath} markerEnd={markerEnd} />
      <foreignObject
        width={deleteBtnSize}
        height={deleteBtnSize}
        x={labelX - deleteBtnSize / 2}
        y={labelY - deleteBtnSize / 2}
        onMouseEnter={() => setShowDeleteBtn(true)}
        onMouseLeave={() => setShowDeleteBtn(false)}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          style={{ width: deleteBtnSize, height: deleteBtnSize }}
          className={`w-6 h-6 flex items-center justify-center bg-red-500 text-white text-sm cursor-pointer rounded-full hover:bg-red-700 transition ${
            showDeleteBtn ? "opacity-1" : "opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            deleteStageEdge(id);
          }}
        >
          <FontAwesomeIcon className="w-3 !h-3" icon={["fas", "xmark"]} />
        </button>
      </foreignObject>
    </>
  );
}

export default StageEdge;
