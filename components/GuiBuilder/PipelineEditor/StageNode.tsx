import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { StageDependencyGraph, StageNodeData } from "@/types/GuiBuilder";
import { transposeGraph } from "@/utils/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, Tooltip } from "@mantine/core";
import { analyzeGraphFast, Graph } from "graph-cycles";
import cloneDeep from "lodash/cloneDeep";
import { DragEventHandler, useState } from "react";
import { Connection, Handle, NodeProps, Position } from "reactflow";

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
 * Checks whether the connection between two nodes is valid.
 *
 * The connection is invalid if adding the connection:
 *  - Makes a node having an out-degree > 1 in the stage execution order graph.
 *  - Creates a cycle in the stage dependency graph.
 */
export const validateConnection = (connection: Connection, stageDeps: StageDependencyGraph) => {
  const { source, target } = connection;
  if (source === null || target === null || source === target) {
    return false;
  }

  const newStageDeps = cloneDeep(stageDeps);
  newStageDeps[target] = [...newStageDeps[target], source];

  // Branched DAGs are currently not supported.
  const newStageExecutionOrderGraph = transposeGraph(newStageDeps);
  if (Object.values(newStageExecutionOrderGraph).some((children) => children.length > 1)) {
    return false;
  }

  /**
   * An array representation of the stage dependency graph.
   * @example
   * const newStageDeps = { A: ["B"], B: ["C"], C: [] }  // C <- B <- A
   * const newStageDepsInArray = [["A", ["B"]], ["B", ["C"]], ["C", []]]
   */
  const newStageDepsInArray = Object.entries(newStageDeps).reduce<Graph>((graph, [id, children]) => {
    const output = [...graph];
    output.push([id, children]);
    return output;
  }, []);
  const { cyclic } = analyzeGraphFast(newStageDepsInArray);
  return cyclic.length === 0;
};

/**
 * A custom React Flow node that represents a stage in the grading pipeline.
 */
function StageNode({ id, data, selected }: NodeProps<StageNodeData>) {
  const [isDragOver, setIsDragOver] = useState(false);

  const stageData = useStoreState((state) => state.config.editingConfig.stageData);
  const stageDeps = useStoreState((state) => state.config.editingConfig.stageDeps);
  const stagesDiagnostics = useStoreState((state) => state.config.diagnostics.stages);
  const draggingNewStage = useStoreState((state) => state.pipelineEditor.draggingNewStage);
  const setShouldFocusLabelInput = useStoreActions((actions) => actions.pipelineEditor.setShouldFocusLabelInput);

  const stageLabel = stageData[id]?.label ?? "";
  const hasUnresolvedDiagnostics = stagesDiagnostics[id]?.some((d) => !d.resolved);

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
          hasUnresolvedDiagnostics && "!border-red-500 border-2",
        )}
        data-label={data.label}
      >
        <Handle
          type="source"
          position={Position.Right}
          isValidConnection={(connection) => validateConnection(connection, stageDeps)}
          className="!p-[5px] !border-2 !bg-cse-600 !-right-[7px]"
        />
        <Handle
          type="target"
          position={Position.Left}
          isValidConnection={(connection) => validateConnection(connection, stageDeps)}
          className="!p-[5px] !border-2 !bg-cse-600 !-left-[7px]"
        />
        {/* When dragging a new stage on top of existing stage, adding "pointer-events-none" avoids firing `dragleave` event
         * in the parent when mouse is over the below div. */}
        <div className={clsx("flex flex-col items-center gap-1", draggingNewStage && "pointer-events-none")}>
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
      {selected && <StageNodeActionButtons id={id} />}
      {hasUnresolvedDiagnostics && (
        <div className="absolute -top-3 -right-3 flex items-center justify-center bg-white text-2xl text-red-500 rounded-full">
          <FontAwesomeIcon icon={["fas", "circle-exclamation"]} />
        </div>
      )}
    </div>
  );
}

interface StageNodeActionButtonsProps {
  id: string;
}

/** Action buttons to show if the stage node is selected. */
function StageNodeActionButtons({ id }: StageNodeActionButtonsProps) {
  const setModal = useStoreActions((actions) => actions.layout.setModal);
  const duplicateStage = useStoreActions((action) => action.pipelineEditor.duplicateStage);

  return (
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
  );
}

export default StageNode;
