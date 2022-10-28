import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { StageNodeData } from "@types";
import { memo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  DefaultEdgeOptions,
  MarkerType,
  Node,
  NodeTypes,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import AddStageButton from "./AddStageButton";
import StageNode from "./StageNode";

const GRID_SIZE = 15;

const nodeTypes: NodeTypes = {
  stage: StageNode,
};

/** Options that newly added edges will get automatically. */
const defaultEdgeOptions: DefaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
};

/**
 * The node-based pipeline editor.
 */
function PipelineEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);
  const reactFlowInstance = useReactFlow();

  const dragging = useStoreState((state) => state.pipelineEditor.dragging);
  const nodes = useStoreState((state) => state.pipelineEditor.nodes);
  const edges = useStoreState((state) => state.pipelineEditor.edges);

  const setNodes = useStoreActions((actions) => actions.setStageNodes);
  const onNodesChange = useStoreActions((actions) => actions.onStageNodesChange);
  const onEdgesChange = useStoreActions((actions) => actions.onStageEdgesChange);
  const onStageConnect = useStoreActions((actions) => actions.onStageConnect);

  return (
    <div
      className={`h-full relative rounded-md transition duration-200 ease-in-out ${
        dragging ? "ring ring-blue-400" : ""
      }`}
      ref={reactFlowWrapper}
    >
      <AddStageButton />
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onStageConnect}
        proOptions={{ account: "", hideAttribution: true }}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        snapToGrid
        className="rounded-md shadow"
        defaultEdgeOptions={defaultEdgeOptions}
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
          const newNode: Node<StageNodeData> = {
            // TODO: Use UUID v4()
            id: Math.random().toString(),
            position,
            data: { name: dragging!.name, label: dragging!.label },
            type: "stage",
          };
          setNodes(nodes.concat(newNode));
        }}
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} className="bg-gray-50" />
      </ReactFlow>
    </div>
  );
}

export default memo(PipelineEditor);
