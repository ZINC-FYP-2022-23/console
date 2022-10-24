import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { StageNodeData } from "@types";
import { Handle, NodeProps, Position } from "reactflow";

/**
 * A custom React Flow node that represents a stage in the grading pipeline.
 */
function StageNode({ id, data, selected }: NodeProps<StageNodeData>) {
  const deleteStageNode = useStoreActions((actions) => actions.deleteStageNode);

  return (
    <div
      className={`px-5 py-3 max-w-[180px] relative font-medium text-center text leading-6 ${
        selected ? "bg-blue-100 outline outline-1 outline-black" : "bg-white"
      } border border-gray-400 rounded-md cursor-pointer`}
    >
      {/* TODO(Anson): Validate handle connection with `isValidConnection` */}
      <Handle className="stage-node-handle" type="source" position={Position.Right} />
      <Handle className="stage-node-handle" type="target" position={Position.Left} />
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
