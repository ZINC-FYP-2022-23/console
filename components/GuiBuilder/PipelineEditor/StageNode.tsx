import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
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

/**
 * A custom React Flow node that represents a stage in the grading pipeline.
 */
function StageNode({ id, data, selected }: NodeProps<StageNodeData>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const stageData = useStoreState((state) => state.editingConfig.stageData);
  const dragging = useStoreState((state) => state.pipelineEditor.dragging);
  const setModal = useStoreActions((actions) => actions.setModal);
  const setShouldFocusLabelInput = useStoreActions((actions) => actions.setShouldFocusLabelInput);
  const duplicateStage = useStoreActions((action) => action.duplicateStage);

  const stageLabel = stageData[id]?.label ?? "";

  return (
    <div className="relative">
      <div
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={onDragOver}
        // PipelineEditor's `onDrop` will check whether the new stage block is dropped onto this stage node.
        onDrop={() => setIsDragOver(false)}
        className={clsx(
          "stage-node", // for PipelineEditor's `onDrop` to check whether the new stage block is dropped onto a stage node
          "px-5 py-3 min-w-[140px] max-w-[175px] relative leading-6 border rounded-md cursor-pointer hover:bg-blue-100 transition",
          ((selected, isDragOver) => {
            if (isDragOver) {
              return "bg-green-100 border-green-600 outline outline-2 outline-green-600";
            } else if (selected) {
              return "bg-blue-100 border-gray-900 outline outline-2 outline-gray-900";
            } else {
              return "bg-white border-gray-400";
            }
          })(selected, isDragOver),
        )}
      >
        {/* TODO(Anson): Validate handle connection with `isValidConnection` */}
        <Handle className="!p-[5px] !border-2 !bg-cse-600 !-right-[7px]" type="source" position={Position.Right} />
        <Handle className="!p-[5px] !border-2 !bg-cse-600 !-left-[7px]" type="target" position={Position.Left} />
        {/* When dragging a new stage on top of existing stage, adding "pointer-events-none" avoids firing `dragleave` event
         * in the parent when mouse is over the below div. */}
        <div className={clsx("flex flex-col items-center gap-1", dragging && "pointer-events-none")}>
          <p className="font-medium text-center leading-5">{data.label}</p>
          {stageLabel !== "" && (
            <div
              className="max-w-[140px] flex items-center px-2 py-1 gap-1 text-sm leading-none rounded-full hover:bg-gray-300 transition"
              onClick={() => setShouldFocusLabelInput(true)}
            >
              <FontAwesomeIcon icon={["fas", "tag"]} className="text-xs text-gray-500" />
              <span className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">{stageLabel}</span>
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div className="absolute left-[50%] -bottom-11 translate-x-[-50%] flex gap-5">
          <Tooltip label="Duplicate stage" position="bottom" openDelay={500}>
            <button
              onClick={() => duplicateStage(id)}
              className="w-8 h-8 flex justify-center items-center text-white bg-green-600 drop-shadow rounded-full hover:bg-green-800 transition"
            >
              <FontAwesomeIcon icon={["far", "copy"]} />
            </button>
          </Tooltip>
          <Tooltip label="Delete stage" position="bottom" openDelay={500}>
            <button
              onClick={() => setModal({ path: "deleteStage", value: true })}
              className="w-8 h-8 flex justify-center items-center text-white bg-red-500 drop-shadow rounded-full hover:bg-red-700 transition"
            >
              <FontAwesomeIcon icon={["far", "trash-can"]} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default StageNode;
