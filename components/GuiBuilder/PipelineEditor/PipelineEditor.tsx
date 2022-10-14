import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { memo, useCallback, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

function AddStageButton() {
  const showAddStage = useStoreState((state) => state.layout.showAddStage);
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);

  return (
    <div className="absolute right-3 top-3 z-10">
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
    </div>
  );
}

const GRID_SIZE = 15;

/**
 * The node-based pipeline editor.
 */
function PipelineEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);
  const reactFlowInstance = useReactFlow();

  const dragging = useStoreState((state) => state.dragging);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div
      className={`h-full relative rounded-md transition duration-200 ease-in-out ${
        dragging ? "ring ring-blue-400" : ""
      }`}
      ref={reactFlowWrapper}
    >
      <AddStageButton />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={{ account: "", hideAttribution: true }}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        snapToGrid
        className="rounded-md shadow"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();

          // Check if the dropped element is a stage node. That's because the droppable area
          // also accepts other items, such as a file.
          const type = event.dataTransfer.getData("application/reactflow");
          if (!type) {
            return;
          }

          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left - 75,
            y: event.clientY - reactFlowBounds.top - 20,
          });
          const newNode: Node = {
            // TODO: Use UUID v4()
            id: Math.random().toString(),
            position,
            data: { label: dragging!.label },
          };
          setNodes((nds) => nds.concat(newNode));
        }}
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} className="bg-gray-50" />
      </ReactFlow>
    </div>
  );
}

export default memo(PipelineEditor);
