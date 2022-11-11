import { useReactFlowFitView, useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import StoreActions from "@state/GuiBuilder/Store";
import { DragEvent, DragEventHandler, memo, useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeTypes,
  OnEdgesDelete,
  OnInit,
  OnNodesDelete,
  ProOptions,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import FloatingActionButtons from "./FloatingActionButtons";
import StageEdgeComponent from "./StageEdge";
import StageNodeComponent from "./StageNode";

const GRID_SIZE = 15;

const nodeTypes: NodeTypes = {
  stage: StageNodeComponent,
};

const edgeTypes: EdgeTypes = {
  stage: StageEdgeComponent,
};

/** Options that newly added edges will get automatically. */
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "stage",
  markerEnd: { type: MarkerType.ArrowClosed },
};

const proOptions: ProOptions = {
  account: "",
  hideAttribution: true,
};

/**
 * Fired when a stage block is dragged over the React Flow editor.
 *
 * The React Flow editor must have `onDragOver` and `onDrop` attributes so that it can become a droppable area.
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#define_a_drop_zone MDN Docs}.
 */
const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
};

/**
 * The node-based pipeline editor.
 */
function PipelineEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);
  const { fitView, project } = useReactFlow();

  const dragging = useStoreState((state) => state.pipelineEditor.dragging);
  const nodes = useStoreState((state) => state.pipelineEditor.nodes);
  const edges = useStoreState((state) => state.pipelineEditor.edges);

  const layoutPipeline = useStoreActions((actions) => actions.layoutPipeline);
  const addStageNode = useStoreActions((actions) => actions.addStageNode);
  const deleteStageEdge = useStoreActions((actions) => actions.deleteStageEdge);
  const deleteStageNode = useStoreActions((actions) => actions.deleteStageNode);
  const onNodesChange = useStoreActions((actions) => actions.onStageNodesChange);
  const onEdgesChange = useStoreActions((actions) => actions.onStageEdgesChange);
  const onStageConnect = useStoreActions((actions) => actions.onStageConnect);

  useReactFlowFitView();

  /**
   * Fit view when the React Flow editor is initialized.
   *
   * By the time this is called, {@link StoreActions.initializePipeline} has already inserted
   * nodes and edges in the editor.
   */
  const onInit: OnInit = useCallback(() => {
    fitView({ padding: 0.2 });
  }, [fitView]);

  /**
   * We pass this handler on top of `onNodesChange` to make sure that `state.editingConfig` is properly
   * updated if the user presses "Backspace" to delete a selected node.
   */
  const onNodesDelete: OnNodesDelete = useCallback(
    (nodes) => {
      // TODO(Anson): Support multi-stage deletion
      // After supporting, we can directly write `onNodesDelete={deleteStageNode}`.
      deleteStageNode(nodes[0].id);
    },
    [deleteStageNode],
  );

  /**
   * We pass this handler on top of `onEdgesChange` to make sure that `state.editingConfig` is properly
   * updated if the user presses "Backspace" to delete a selected edge.
   */
  const onEdgesDelete: OnEdgesDelete = useCallback(
    (edges) => {
      // TODO(Anson): Support multi-edge deletion
      deleteStageEdge(edges[0].id);
    },
    [deleteStageEdge],
  );

  /** Handler for dropping a stage block to the React Flow editor. */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Check if the dropped element is a stage node. That's because the droppable area
      // also accepts other items, such as a file.
      const type = event.dataTransfer.getData("application/reactflow");
      if (type !== "stage") {
        return;
      }

      const target = event.target;
      if (target instanceof Element) {
        // Dropped on an existing stage node
        if (typeof target.className === "string" && target.className.includes("stage-node")) {
          // The wrapper element that wraps the `target` has a node ID attribute
          const targetNodeId = target.closest(".react-flow__node")?.getAttribute("data-id");
          if (targetNodeId) {
            addStageNode({
              position: { x: 0, y: 0 }, // Position will be updated in `layoutPipeline()`
              parent: targetNodeId,
            });
            layoutPipeline();
          }
        }
        // Dropped on an empty space outside a stage node
        else {
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          const position = project({
            x: event.clientX - reactFlowBounds.left - 75,
            y: event.clientY - reactFlowBounds.top - 20,
          });
          addStageNode({ position });
        }
      }
    },
    [addStageNode, layoutPipeline, project],
  );

  return (
    <div
      className={`h-full relative rounded-md shadow overflow-hidden transition duration-200 ease-in-out ${
        dragging ? "ring ring-blue-400" : ""
      }`}
      ref={reactFlowWrapper}
    >
      <FloatingActionButtons />
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={onInit}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onStageConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        snapToGrid
        // TODO(Anson): Re-enable selection only if multi-deleting nodes/edges can update `editingConfig` properly.
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        proOptions={proOptions}
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} className="bg-gray-50" />
      </ReactFlow>
    </div>
  );
}

export default memo(PipelineEditor);
