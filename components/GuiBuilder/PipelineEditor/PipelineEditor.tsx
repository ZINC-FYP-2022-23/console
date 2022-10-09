import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { memo, useCallback } from "react";
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";

function AddStageButton() {
  return (
    <div className="absolute right-3 top-3 z-10">
      <Tooltip label="Add stage" position="bottom" withArrow transition="fade" transitionDuration={200}>
        <button
          className="h-11 w-11 flex items-center justify-center bg-cse-700 text-white rounded-full drop-shadow"
          onClick={() => {
            // TODO
          }}
        >
          <FontAwesomeIcon icon={["fas", "plus"]} className="text-xl" />
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
