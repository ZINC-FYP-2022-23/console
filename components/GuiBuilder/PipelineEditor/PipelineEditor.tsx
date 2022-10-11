import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { memo, useCallback } from "react";
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { useStoreActions, useStoreState } from "state/GuiBuilder/Hooks";

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

const initialNodes = [
  { id: "1", position: { x: 250, y: 100 }, data: { label: "Hello" } },
  { id: "2", position: { x: 250, y: 200 }, data: { label: "World" } },
];

/**
 * The node-based pipeline editor.
 */
function PipelineEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="h-full relative rounded-md shadow">
      <AddStageButton />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={{ account: "", hideAttribution: true }}
        snapToGrid
        className="rounded-md shadow"
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} gap={15} className="bg-gray-50" />
      </ReactFlow>
    </div>
  );
}

export default memo(PipelineEditor);
