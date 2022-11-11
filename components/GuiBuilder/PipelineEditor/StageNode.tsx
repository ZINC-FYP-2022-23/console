import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { StageNodeData } from "@types";
import { DragEventHandler, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";

/**
 * Fired when a stage block is dragged over this stage node.
 *
 * The node must have `onDragOver` and `onDrop` attributes so that it can become a droppable area.
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#define_a_drop_zone MDN Docs}.
 */
const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
};

const extraStyles = (isSelected: boolean, isDragOver: boolean) => {
  if (isDragOver) {
    return "bg-green-100 border-green-600 outline outline-2 outline-green-600";
  } else if (isSelected) {
    return "bg-blue-100 border-gray-900 outline outline-2 outline-gray-900";
  } else {
    return "bg-white";
  }
};

/**
 * A custom React Flow node that represents a stage in the grading pipeline.
 */
function StageNode({ id, data, selected }: NodeProps<StageNodeData>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const deleteStageNode = useStoreActions((actions) => actions.deleteStageNode);

  return (
    <div
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDragOver={onDragOver}
      // PipelineEditor's `onDrop` will check whether the new stage block is dropped onto this stage node.
      onDrop={() => setIsDragOver(false)}
      // The `"stage-node"` class is for PipelineEditor's `onDrop` to check whether the new stage block is
      // dropped onto a stage node.
      className={`stage-node ${extraStyles(
        selected,
        isDragOver,
      )} px-5 py-3 min-w-[140px] max-w-[175px] relative font-medium text-center text leading-6 border border-gray-400 rounded-md cursor-pointer hover:bg-blue-100 transition `}
    >
      {/* TODO(Anson): Validate handle connection with `isValidConnection` */}
      <Handle className="!p-[5px] !border-2 !bg-cse-600 !-right-[7px]" type="source" position={Position.Right} />
      <Handle className="!p-[5px] !border-2 !bg-cse-600 !-left-[7px]" type="target" position={Position.Left} />
      {data.label}
      {selected && (
        <button
          onClick={() => deleteStageNode(id)}
          className="p-1 absolute -top-3 -right-3 flex items-center text-white bg-red-500 rounded-full hover:bg-red-700 transition"
        >
          <FontAwesomeIcon className="w-3 h-3" icon={["fas", "xmark"]} />
        </button>
      )}
    </div>
  );
}

export default StageNode;
