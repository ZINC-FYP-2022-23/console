import supportedStages, { SupportedStage } from "@constants/GuiBuilder/supportedStages";
import { Stage, StageNode } from "@types";
import { deleteStageFromDeps } from "@utils/GuiBuilder";
import { coordQuad, dagConnect, sugiyama } from "d3-dag";
import { action, Action, computed, Computed, thunk, Thunk, thunkOn, ThunkOn } from "easy-peasy";
import camelCase from "lodash/camelCase";
import cloneDeep from "lodash/cloneDeep";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  EdgeRemoveChange,
  getConnectedEdges,
  NodeChange,
  XYPosition,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { GuiBuilderModel } from "../guiBuilderModel";
import { ConfigModel } from "./configModel";

// #region Model Definition

/**
 * Model for the node-based editor to construct the grading pipeline.
 */
export type PipelineEditorModel = PipelineEditorModelState &
  PipelineEditorModelComputed &
  PipelineEditorModelAction &
  PipelineEditorModelThunk &
  PipelineEditorModelThunkOn;

interface PipelineEditorModelState {
  /** Data being dragged from Add Stage panel. */
  dragging?: { stageName: string; stageData: SupportedStage };
  /** Pipeline stage nodes. */
  nodes: StageNode[];
  /** Edges that connect pipeline stage nodes. */
  edges: Edge[];
  /** Whether the editor should fit view to the nodes on the pane. */
  shouldFitView: boolean;
  /** Whether to focus the selected stage's label input box. */
  shouldFocusLabelInput: boolean;
  /** ID of a stage the user wishes to duplicate by pressing `Ctrl/Cmd + C`. */
  copiedStageId?: string;
}

interface PipelineEditorModelComputed {
  /** Which stage is selected in the pipeline editor. */
  selectedStage: Computed<
    PipelineEditorModel,
    {
      id: string;
      /** Stage name code (e.g. `"DiffWithSkeleton"`). */
      name: string;
      /** Stage name shown in UI (e.g. `"Diff With Skeleton"`). */
      nameInUI: string;
      /** See {@link Stage.label}. */
      label: string;
    } | null,
    GuiBuilderModel
  >;
}

interface PipelineEditorModelAction {
  /**
   * Layouts the graph in the pipeline editor.
   *
   * It uses {@link https://github.com/erikbrinkman/d3-dag d3-dag} to layout the graph. This layout
   * algorithm works on both linked list shaped graph and branched DAGs.
   */
  layoutPipeline: Action<PipelineEditorModel>;

  setDragging: Action<PipelineEditorModel, { stageName: string; stageData: SupportedStage } | undefined>;
  setNodes: Action<PipelineEditorModel, StageNode[]>;
  setEdges: Action<PipelineEditorModel, Edge[]>;
  setShouldFitView: Action<PipelineEditorModel, boolean>;
  setShouldFocusLabelInput: Action<PipelineEditorModel, boolean>;
  setCopiedStageId: Action<PipelineEditorModel, string | undefined>;

  /** Called on drag, select and remove of stage nodes. */
  onStageNodesChange: Action<PipelineEditorModel, NodeChange[]>;
  /** Called on select and remove of stage edges. */
  onStageEdgesChange: Action<PipelineEditorModel, EdgeChange[]>;
}

interface PipelineEditorModelThunk {
  /**
   * Initializes nodes and edges to the pipeline editor according to the data in
   * {@link ConfigModel.initConfig}.
   *
   * This function should be called after {@link ConfigModel.initializeConfig}.
   */
  initializePipeline: Thunk<PipelineEditorModel, undefined, undefined, GuiBuilderModel>;
  /** Called when user connects two stage nodes. */
  onStageConnect: Thunk<PipelineEditorModel, Connection, undefined, GuiBuilderModel>;
  /** Adds a new stage which is being dragged by the user. */
  addStageNode: Thunk<
    PipelineEditorModel,
    {
      position: XYPosition;
      /**
       * ID of an existing stage that the new stage wishes to be its child.
       *
       * e.g. If new stage `B` wants to be a child of `A` such that `A -> B`, then `A` is the parent.
       */
      parent?: string;
    },
    undefined,
    GuiBuilderModel
  >;
  /** Deletes a stage node given its ID. */
  deleteStageNode: Thunk<PipelineEditorModel, string, undefined, GuiBuilderModel>;
  /**
   * Deletes a stage edge given its ID. It's called when the user presses "Backspace" after selecting the
   * stage edge or presses the red delete icon button.
   */
  deleteStageEdge: Thunk<PipelineEditorModel, string, undefined, GuiBuilderModel>;
  /** Duplicates a stage given its ID. */
  duplicateStage: Thunk<PipelineEditorModel, string, undefined, GuiBuilderModel>;
}

interface PipelineEditorModelThunkOn {
  /**
   * Automatically triggers {@link PipelineEditorModel.layoutPipeline} after certain actions
   * (see implementation for the exact actions) are dispatched.
   */
  triggerLayoutPipeline: ThunkOn<PipelineEditorModel>;
}

// #endregion

// #region Model Implementation

const pipelineEditorState: PipelineEditorModelState = {
  nodes: [],
  edges: [],
  shouldFitView: false,
  shouldFocusLabelInput: false,
};

const pipelineEditorComputed: PipelineEditorModelComputed = {
  selectedStage: computed(
    [(state) => state.nodes, (_, storeState) => storeState.config.editingConfig.stageData],
    (nodes, stageData) => {
      const selectedNode = nodes.find((node) => node.selected);
      if (selectedNode === undefined) {
        return null;
      }

      const id = selectedNode.id;
      const selectedStageData: Stage<any> | undefined = stageData[id];
      if (selectedStageData === undefined) {
        console.warn(`Unable to find stage with ID ${id} in the stageData.`);
        return null;
      }

      const name = selectedStageData.name;
      return {
        id,
        name,
        nameInUI: supportedStages[name]?.nameInUI ?? name,
        label: selectedStageData.label,
      };
    },
  ),
};

const pipelineEditorAction: PipelineEditorModelAction = {
  layoutPipeline: action((state) => {
    if (state.edges.length === 0) {
      return;
    }

    // Construct DAG from list of edges
    const edges: [string, string][] = state.edges.map((edge) => [edge.source, edge.target]);
    const dag = dagConnect()(edges);

    /** Spacing between nodes in terms of `[horizontalGap, verticalGap]` */
    const nodeSpacing = [120, 235] as const;

    const layout = sugiyama() // "Sugiyama" is a layout style where nodes are arranged top-to-bottom in layers
      .coord(coordQuad()) // Specify how to assign coordinates to nodes. `coordQuad()` looks most pleasing
      .nodeSize((d) => (d === undefined ? [0, 0] : nodeSpacing)); // How much spacing between nodes

    // Layout the DAG by mutating `dag` directly
    layout(dag as any);

    // Updates the coordinates of nodes
    state.nodes = state.nodes.map((node) => {
      let position = { x: node.position.x, y: node.position.y };
      const dagNode = dag.descendants().find((d) => d.data.id === node.id);
      if (dagNode) {
        position = { x: dagNode.y!, y: -dagNode.x! }; // Rotate 90 degrees anti-clockwise
      }
      return { ...node, position };
    });

    state.shouldFitView = true; // since coords of nodes have changed
  }),

  setDragging: action((state, supportedStage) => {
    state.dragging = supportedStage;
  }),
  setNodes: action((state, nodes) => {
    state.nodes = nodes;
  }),
  setEdges: action((state, edges) => {
    state.edges = edges;
  }),
  setShouldFitView: action((state, shouldFitView) => {
    state.shouldFitView = shouldFitView;
  }),
  setShouldFocusLabelInput: action((state, shouldFocusLabelInput) => {
    state.shouldFocusLabelInput = shouldFocusLabelInput;
  }),
  setCopiedStageId: action((state, stageId) => {
    state.copiedStageId = stageId;
  }),

  onStageNodesChange: action((state, changes) => {
    state.nodes = applyNodeChanges(changes, state.nodes);
  }),
  onStageEdgesChange: action((state, changes) => {
    state.edges = applyEdgeChanges(changes, state.edges);
  }),
};

const pipelineEditorThunk: PipelineEditorModelThunk = {
  initializePipeline: thunk((actions, _, { getStoreState }) => {
    const initConfig = getStoreState().config.initConfig;

    // Populate nodes
    const nodes = Object.entries(initConfig.stageData).map(([id, stage]) => {
      const stageMetadata: SupportedStage | undefined = supportedStages[stage.name];
      const node: StageNode = {
        id,
        // Note: `triggerLayoutPipeline()` will be called after `initializePipeline()`, which layouts the graph
        // and updates the nodes' positions.
        position: { x: 0, y: 0 },
        data: {
          name: stage.name,
          label: stageMetadata?.nameInUI ?? stage.name,
        },
        type: "stage",
      };
      return node;
    });
    actions.setNodes(nodes);

    // Populate edges
    const edges: Edge[] = [];
    Object.entries(initConfig.stageDeps).forEach(([id, deps]) => {
      deps.forEach((depId) => {
        const source = depId;
        const target = id;
        edges.push({
          id: `reactflow__edge-${source}-${target}`,
          source,
          target,
          type: "stage",
        });
      });
    });
    actions.setEdges(edges);
  }),
  onStageConnect: thunk((actions, connection, { getState, getStoreState, getStoreActions }) => {
    const edges = addEdge(connection, getState().edges);
    actions.setEdges(edges);

    if (connection.source && connection.target) {
      // e.g. Connection of "A -> B" means "B" depends on "A"
      // So in `stageDeps`: { "B": [], ... } --> { "B": ["A"], ... }
      const targetDeps = getStoreState().config.editingConfig.stageDeps[connection.target];
      getStoreActions().config.updateStageDeps({
        stageId: connection.target,
        deps: [...targetDeps, connection.source],
      });
    }
  }),
  addStageNode: thunk((actions, payload, { getState, getStoreState, getStoreActions }) => {
    const { position, parent } = payload;
    const dragging = getState().dragging;
    if (!dragging) return;

    // Update pipeline editor data
    const stageId = uuidv4();
    const newNode: StageNode = {
      id: stageId,
      position,
      data: { name: dragging.stageName, label: dragging.stageData.nameInUI },
      type: "stage",
    };
    actions.setNodes(getState().nodes.concat(newNode));

    // Update `editingConfig`
    getStoreActions().config.updateStageDeps({ stageId, deps: [] });
    getStoreActions().config.setStageData({
      stageId,
      stage: {
        name: dragging.stageName,
        label: "",
        kind: dragging.stageData.kind,
        config: cloneDeep(dragging.stageData.defaultConfig),
      },
    });

    // Insert new node into the linked list of stages
    if (parent) {
      // e.g. Existing graph is `A -> B` and new node `N` has parent of `A`.
      // Graph will change from `A -> B` to `A -> N -> B`
      const oldEdge = getState().edges.find((edge) => edge.source === parent); // A -> B

      // Add `A -> N`
      actions.setEdges([
        ...getState().edges,
        // Add `A -> N`
        {
          id: `reactflow__edge-${parent}-${stageId}`,
          source: parent,
          target: stageId,
          type: "stage",
        },
      ]);
      getStoreActions().config.updateStageDeps({
        stageId,
        deps: [...getStoreState().config.editingConfig.stageDeps[stageId], parent],
      });

      if (oldEdge) {
        // Remove `A -> B`
        actions.setEdges(getState().edges.filter((edge) => edge.id !== oldEdge.id));
        getStoreActions().config.updateStageDeps({
          stageId: oldEdge.target,
          deps: getStoreState().config.editingConfig.stageDeps[oldEdge.target].filter(
            (depId) => depId !== oldEdge.source,
          ),
        });
        // Add `N -> B`
        actions.setEdges([
          ...getState().edges,
          {
            id: `reactflow__edge-${stageId}-${oldEdge.target}`,
            source: stageId,
            target: oldEdge.target,
            type: "stage",
          },
        ]);
        getStoreActions().config.updateStageDeps({
          stageId: oldEdge.target,
          deps: [...getStoreState().config.editingConfig.stageDeps[oldEdge.target], stageId],
        });
      }
    }
  }),
  deleteStageNode: thunk((actions, id, { getState, getStoreState, getStoreActions }) => {
    // In pipeline editor, remove the node and all edges connected to it.
    const node = getState().nodes.find((node) => node.id === id);
    if (node) {
      const connectedEdges = getConnectedEdges([node], getState().edges);
      const edgesToRemove: EdgeRemoveChange[] = connectedEdges.map((edge) => ({
        id: edge.id,
        type: "remove",
      }));
      actions.setNodes(applyNodeChanges([{ id: node.id, type: "remove" }], getState().nodes));
      actions.setEdges(applyEdgeChanges(edgesToRemove, getState().edges));
    }

    // Delete stage data from `editingConfig`
    getStoreActions().config.setStageData({ stageId: id, stage: null });
    const stageDepsNew = deleteStageFromDeps(id, getStoreState().config.editingConfig.stageDeps);
    getStoreActions().config.setStageDeps(stageDepsNew);
  }),
  deleteStageEdge: thunk((actions, id, { getState, getStoreState, getStoreActions }) => {
    // e.g. Delete edge "A -> B" in pipeline editor means remove "A" from "B"'s dependencies
    // So in `stageDeps`: { "B": ["A"], ... } --> { "B": [], ... }
    const source = getState().edges.find((edge) => edge.id === id)!.source; // e.g. "A"
    const target = getState().edges.find((edge) => edge.id === id)!.target; // e.g. "B"

    const edgesNew = applyEdgeChanges([{ id, type: "remove" }], getState().edges);
    actions.setEdges(edgesNew);

    const targetDeps = getStoreState().config.editingConfig.stageDeps[target];
    getStoreActions().config.updateStageDeps({
      stageId: target,
      deps: targetDeps.filter((depId) => depId !== source),
    });
  }),
  duplicateStage: thunk((actions, sourceId, { getState, getStoreState, getStoreActions }) => {
    const sourceData: Stage | undefined = getStoreState().config.editingConfig.stageData[sourceId];
    const sourceNode = getState().nodes.find((node) => node.id === sourceId);

    if (sourceData === undefined || sourceNode === undefined) {
      console.warn(`Failed to duplicate stage of id '${sourceId}' because it does not exist.`);
      return;
    }

    // Duplicate stage data in `editingConfig`
    const targetId = uuidv4();
    const targetData = cloneDeep(sourceData);
    targetData.label = camelCase(targetData.label + "Copy");
    getStoreActions().config.setStageData({ stageId: targetId, stage: targetData });
    getStoreActions().config.updateStageDeps({ stageId: targetId, deps: [] });

    // Duplicate React Flow node
    const targetNode = cloneDeep(sourceNode);
    targetNode.id = targetId;
    targetNode.position.y += (targetNode.height || 50) * 1.5; // Place below the source node
    targetNode.selected = true; // Select the newly duplicated stage
    actions.setNodes([...getState().nodes, targetNode]);

    // De-select all other nodes
    actions.setNodes(
      getState().nodes.map((node) => {
        return node.id === targetId ? node : { ...node, selected: false };
      }),
    );
  }),
};

const pipelineEditorThunkOn: PipelineEditorModelThunkOn = {
  triggerLayoutPipeline: thunkOn(
    (actions) => [actions.initializePipeline],
    (actions) => {
      actions.layoutPipeline();
    },
  ),
};

export const pipelineEditorModel: PipelineEditorModel = {
  ...pipelineEditorState,
  ...pipelineEditorComputed,
  ...pipelineEditorAction,
  ...pipelineEditorThunk,
  ...pipelineEditorThunkOn,
};

// #endregion
