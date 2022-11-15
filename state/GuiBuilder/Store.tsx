/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */

import guiBuilderSteps from "@components/GuiBuilder/Steps/GuiBuilderSteps";
import { defaultConfig, defaultPolicy, defaultSchedule } from "@constants/Config/defaults";
import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import type { Config, GradingPolicy, Schedule, StageNode } from "@types";
import { deleteStageFromDeps, isConfigEqual, isScheduleEqual, parseConfigYaml } from "@utils/Config";
import { coordQuad, dagConnect, sugiyama } from "d3-dag";
import { Action, action, computed, Computed, createStore, StoreProvider, thunkOn, ThunkOn } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import set from "lodash/set";
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

/////////////// STORE DEFINITION ///////////////

export type GuiBuilderStoreModel = StoreStates & StoreActions;
export type StoreActions = BaseActions & LayoutActions & PipelineEditorActions;

/**
 * @remarks It should **only** store plain serializable objects, arrays, and primitives. Do **not** use
 * ES6 classes, functions, Maps, Sets, etc. Otherwise, easy-peasy will have trouble detecting changes
 * in the store (See {@link https://stackoverflow.com/q/74002866/11067496 Stack Overflow}).
 */
export interface StoreStates {
  /** The assignment config ID. It's `null` if we're creating a new assignment. */
  configId: number | null;
  /** The ID of the course that this config belongs to. */
  courseId: number;

  /** Initial configuration (e.g. when loaded from database). It should be immutable after initialization. */
  initConfig: Config;
  /** The config with proposed changes. */
  editingConfig: Config;
  /** Initial grading policy of the assignment. It should be immutable after initialization. */
  initPolicy: GradingPolicy;
  /** The grading policy with proposed changes */
  editingPolicy: GradingPolicy;
  /** Initial scheduling of the assignment. It should be immutable after initialization. */
  initSchedule: Schedule;
  /** The scheduling with proposed changes. */
  editingSchedule: Schedule;

  layout: {
    /** Zero-based index of which step the user is in. */
    step: number;
    /** Which accordion components are opened. */
    accordion: AccordionState;
  };

  pipelineEditor: {
    /** Data being dragged from Add Stage panel. */
    dragging?: { stageName: string; stageData: SupportedStage };
    /** Whether the editor should fit view to the nodes on the pane. */
    shouldFitView: boolean;
    /** Pipeline stage nodes. */
    nodes: StageNode[];
    /** Edges that connect pipeline stage nodes. */
    edges: Edge[];
  };
}

export interface BaseActions {
  setCourseId: Action<GuiBuilderStoreModel, number>;
  initializeConfig: Action<GuiBuilderStoreModel, { id: number | null; configYaml: string }>;
  initializePolicy: Action<GuiBuilderStoreModel, GradingPolicy>;
  initializeSchedule: Action<GuiBuilderStoreModel, Schedule>;

  /** Updates a field in `editingConfig` given its `path`. */
  updateField: Action<GuiBuilderStoreModel, { path: string; value: any }>;
  updatePolicy: Action<GuiBuilderStoreModel, GradingPolicy>;
  updateSchedule: Action<GuiBuilderStoreModel, Schedule>;

  /** Whether the config has been edited. */
  isEdited: Computed<GuiBuilderStoreModel, boolean>;
}

/** Actions for {@link StoreStates.layout}. */
export interface LayoutActions {
  setStep: Action<GuiBuilderStoreModel, number>;
  setAccordion: Action<
    GuiBuilderStoreModel,
    {
      /** Path to update the `accordions` state (e.g. `"settingsPanel.policy"`). */
      path: string;
      value: boolean;
    }
  >;
}

/** Actions for {@link StoreStates.pipelineEditor}. */
export interface PipelineEditorActions {
  /** Which stage is selected in the pipeline editor. */
  selectedStage: Computed<GuiBuilderStoreModel, { id: string; name: string } | null>;

  /**
   * Automatically triggers {@link PipelineEditorActions.layoutPipeline} after certain actions
   * (see implementation for the exact actions) are dispatched.
   */
  triggerLayoutPipeline: ThunkOn<GuiBuilderStoreModel>;

  /**
   * Initializes nodes and edges to the pipeline editor according to the data in
   * {@link StoreStates.initConfig}.
   *
   * @remarks This function should be called after {@link BaseActions.initializeConfig}.
   */
  initializePipeline: Action<GuiBuilderStoreModel>;
  /** Layouts the graph in the pipeline editor. */
  layoutPipeline: Action<GuiBuilderStoreModel>;

  setDragging: Action<GuiBuilderStoreModel, { stageName: string; stageData: SupportedStage } | undefined>;
  setShouldFitView: Action<GuiBuilderStoreModel, boolean>;
  /** Called on drag, select and remove of stage nodes. */
  onStageNodesChange: Action<GuiBuilderStoreModel, NodeChange[]>;
  /** Called on select and remove of stage edges. */
  onStageEdgesChange: Action<GuiBuilderStoreModel, EdgeChange[]>;
  /** Called when user connects two stage nodes. */
  onStageConnect: Action<GuiBuilderStoreModel, Connection>;

  /** Called when a new stage is added. */
  addStageNode: Action<
    GuiBuilderStoreModel,
    {
      position: XYPosition;
      /**
       * ID of an existing stage that the new stage wishes to be its child.
       *
       * e.g. If new stage `B` wants to be a child of `A` such that `A -> B`, then `A` is the parent.
       */
      parent?: string;
    }
  >;
  /**
   * Deletes a stage node given its ID. It's called when the user presses "Backspace" after selecting the
   * stage node or presses the red delete icon button.
   */
  deleteStageNode: Action<GuiBuilderStoreModel, string>;
  /**
   * Deletes a stage edge given its ID. It's called when the user presses "Backspace" after selecting the
   * stage edge or presses the red delete icon button.
   */
  deleteStageEdge: Action<GuiBuilderStoreModel, string>;

  /** Duplicates the selected stage. */
  duplicateStage: Action<GuiBuilderStoreModel>;
}

export interface AccordionState {
  addNewStage: {
    preCompile: boolean;
    compile: boolean;
    testCases: boolean;
    miscStages: boolean;
  };
}

/////////////// STORE IMPLEMENTATION ///////////////

export const baseActions: BaseActions = {
  setCourseId: action((state, courseId) => {
    state.courseId = courseId;
  }),
  initializeConfig: action((state, payload) => {
    const { id, configYaml } = payload;
    const config = parseConfigYaml(configYaml);
    state.initConfig = config;
    state.editingConfig = cloneDeep(config);
    state.configId = id;
  }),
  initializePolicy: action((state, gradingPolicy) => {
    state.initPolicy = gradingPolicy;
    state.editingPolicy = { ...gradingPolicy };
  }),
  initializeSchedule: action((state, schedule) => {
    state.initSchedule = schedule;
    state.editingSchedule = { ...schedule };
  }),

  updateField: action((state, payload) => {
    set(state.editingConfig, payload.path, payload.value);
  }),
  updatePolicy: action((state, gradingPolicy) => {
    state.editingPolicy = gradingPolicy;
  }),
  updateSchedule: action((state, schedule) => {
    state.editingSchedule = schedule;
  }),

  isEdited: computed((state) => {
    const isConfigEdited = !isConfigEqual(state.initConfig, state.editingConfig);
    const isPolicyEdited = !isEqual(state.initPolicy, state.editingPolicy);
    const isScheduleEdited = !isScheduleEqual(state.initSchedule, state.editingSchedule);
    return isConfigEdited || isPolicyEdited || isScheduleEdited;
  }),
};

export const layoutActions: LayoutActions = {
  setStep: action((state, step) => {
    if (step < 0 || step >= guiBuilderSteps.length) {
      console.warn(`Step number is out of range: ${step}`);
      return;
    }
    state.layout.step = step;
  }),
  setAccordion: action((state, payload) => {
    set(state.layout.accordion, payload.path, payload.value);
  }),
};

export const pipelineEditorActions: PipelineEditorActions = {
  selectedStage: computed((state) => {
    const selectedNode = state.pipelineEditor.nodes.find((node) => node.selected);
    if (selectedNode === undefined) {
      return null;
    }

    const id = selectedNode.id;
    return {
      id,
      name: state.editingConfig.stageData[id].name,
    };
  }),

  triggerLayoutPipeline: thunkOn(
    (actions) => [actions.initializePipeline],
    (actions) => {
      actions.layoutPipeline();
    },
  ),

  initializePipeline: action((state) => {
    // Populate nodes
    state.pipelineEditor.nodes = Object.entries(state.initConfig.stageData).map(([id, stage]) => {
      const stageMetadata: SupportedStage | undefined = supportedStages[stage.name];
      const node: StageNode = {
        id,
        // `triggerLayoutPipeline()` will be called after `initializePipeline()`, which layouts the graph
        // and updates the nodes' positions.
        position: { x: 0, y: 0 },
        data: {
          name: stage.name,
          label: stageMetadata?.label ?? stage.name,
        },
        type: "stage",
      };
      return node;
    });

    // Populate edges
    Object.entries(state.initConfig.stageDeps).forEach(([id, deps]) => {
      deps.forEach((depId) => {
        const source = depId;
        const target = id;
        state.pipelineEditor.edges.push({
          id: `reactflow__edge-${source}-${target}`,
          source,
          target,
          type: "stage",
        });
      });
    });
  }),
  layoutPipeline: action((state) => {
    if (state.pipelineEditor.edges.length === 0) {
      return;
    }

    // We use `d3-dag` (https://github.com/erikbrinkman/d3-dag) to layout the pipeline.
    // This layout algorithm works on both linked list shaped graph and branched DAGs.

    // Construct DAG from list of edges
    const edges: [string, string][] = state.pipelineEditor.edges.map((edge) => [edge.source, edge.target]);
    const dag = dagConnect()(edges);

    /** Spacing between nodes in terms of `[horizontalGap, verticalGap]` */
    const nodeSpacing = [120, 235] as const;

    const layout = sugiyama() // "Sugiyama" is a layout style where nodes are arranged top-to-bottom in layers
      .coord(coordQuad()) // Specify how to assign coordinates to nodes. `coordQuad()` looks most pleasing
      .nodeSize((d) => (d === undefined ? [0, 0] : nodeSpacing)); // How much spacing between nodes

    // Layout the DAG by mutating `dag` directly
    layout(dag as any);

    // Updates the coordinates of nodes
    state.pipelineEditor.nodes = state.pipelineEditor.nodes.map((node) => {
      let position = { x: node.position.x, y: node.position.y };
      const dagNode = dag.descendants().find((d) => d.data.id === node.id);
      if (dagNode) {
        position = { x: dagNode.y!, y: -dagNode.x! }; // Rotate 90 degrees anti-clockwise
      }
      return { ...node, position };
    });

    state.pipelineEditor.shouldFitView = true; // since coords of nodes have changed
  }),

  setDragging: action((state, supportedStage) => {
    state.pipelineEditor.dragging = supportedStage;
  }),
  setShouldFitView: action((state, shouldFitView) => {
    state.pipelineEditor.shouldFitView = shouldFitView;
  }),
  onStageNodesChange: action((state, changes) => {
    state.pipelineEditor.nodes = applyNodeChanges(changes, state.pipelineEditor.nodes);
  }),
  onStageEdgesChange: action((state, changes) => {
    state.pipelineEditor.edges = applyEdgeChanges(changes, state.pipelineEditor.edges);
  }),
  onStageConnect: action((state, connection) => {
    state.pipelineEditor.edges = addEdge(connection, state.pipelineEditor.edges);

    if (connection.source && connection.target) {
      // e.g. Connection of "A -> B" means "B" depends on "A"
      // So in `stageDeps`: { "B": [], ... } --> { "B": ["A"], ... }
      const targetDeps = state.editingConfig.stageDeps[connection.target];
      state.editingConfig.stageDeps[connection.target] = [...targetDeps, connection.source];
    }
  }),

  addStageNode: action((state, payload) => {
    const { position, parent } = payload;
    const dragging = state.pipelineEditor.dragging;
    if (!dragging) return;

    // Update pipeline editor data
    const stageId = uuidv4();
    const newNode: StageNode = {
      id: stageId,
      position,
      data: { name: dragging.stageName, label: dragging.stageData.label },
      type: "stage",
    };
    state.pipelineEditor.nodes = state.pipelineEditor.nodes.concat(newNode);

    // Update `editingConfig`
    state.editingConfig.stageDeps[stageId] = [];
    state.editingConfig.stageData[stageId] = {
      key: dragging.stageName.charAt(0).toLowerCase() + dragging.stageName.slice(1),
      name: dragging.stageName,
      kind: dragging.stageData.kind,
      config: cloneDeep(dragging.stageData.defaultConfig),
    };

    // Insert new node into the linked list of stages
    if (parent) {
      // e.g. Existing graph is `A -> B` and new edge `N` has parent of `A`.
      // Graph will change from `A -> B` to `A -> N -> B`
      const oldEdge = state.pipelineEditor.edges.find((edge) => edge.source === parent); // A -> B

      // Add `A -> N`
      state.pipelineEditor.edges.push({
        id: `reactflow__edge-${parent}-${stageId}`,
        source: parent,
        target: stageId,
        type: "stage",
      });
      state.editingConfig.stageDeps[stageId].push(parent);

      if (oldEdge) {
        // Remove `A -> B`
        state.pipelineEditor.edges = state.pipelineEditor.edges.filter((edge) => edge.id !== oldEdge.id);
        state.editingConfig.stageDeps[oldEdge.target] = state.editingConfig.stageDeps[oldEdge.target].filter(
          (depId) => depId !== oldEdge.source,
        );
        // Add `N -> B`
        state.pipelineEditor.edges.push({
          id: `reactflow__edge-${stageId}-${oldEdge.target}`,
          source: stageId,
          target: oldEdge.target,
          type: "stage",
        });
        state.editingConfig.stageDeps[oldEdge.target].push(stageId);
      }
    }
  }),
  deleteStageNode: action((state, id) => {
    // In pipeline editor, remove the node and all edges connected to it.
    const node = state.pipelineEditor.nodes.find((node) => node.id === id);
    if (node) {
      const connectedEdges = getConnectedEdges([node], state.pipelineEditor.edges);
      const edgesToRemove: EdgeRemoveChange[] = connectedEdges.map((edge) => ({
        id: edge.id,
        type: "remove",
      }));
      state.pipelineEditor.nodes = applyNodeChanges([{ id: node.id, type: "remove" }], state.pipelineEditor.nodes);
      state.pipelineEditor.edges = applyEdgeChanges(edgesToRemove, state.pipelineEditor.edges);
    }

    // Delete stage data from `editingConfig`
    delete state.editingConfig.stageData[id];
    deleteStageFromDeps(id, state.editingConfig.stageDeps);
  }),
  deleteStageEdge: action((state, id) => {
    // e.g. Delete edge "A -> B" in pipeline editor means remove "A" from "B"'s dependencies
    // So in `stageDeps`: { "B": ["A"], ... } --> { "B": [], ... }
    const source = state.pipelineEditor.edges.find((edge) => edge.id === id)!.source; // e.g. "A"
    const target = state.pipelineEditor.edges.find((edge) => edge.id === id)!.target; // e.g. "B"

    state.pipelineEditor.edges = applyEdgeChanges([{ id, type: "remove" }], state.pipelineEditor.edges);

    const targetDeps = state.editingConfig.stageDeps[target];
    state.editingConfig.stageDeps[target] = targetDeps.filter((depId) => depId !== source);
  }),

  duplicateStage: action((state) => {
    if (state.selectedStage) {
      const stageId = uuidv4();

      const stageData = state.editingConfig.stageData[state.selectedStage.id];
      const stageDataCopy = cloneDeep(stageData);
      state.editingConfig.stageData[stageId] = stageDataCopy;
      state.editingConfig.stageDeps[stageId] = [];

      const selectedNode = state.pipelineEditor.nodes.find((node) => node.id === state.selectedStage!.id);
      if (selectedNode) {
        const newNode = cloneDeep(selectedNode);
        newNode.id = stageId;
        newNode.selected = false;
        newNode.position.y += (newNode.height || 50) * 1.5; // Place the new node below the selected node
        state.pipelineEditor.nodes.push(newNode);

        // Select the newly duplicated stage
        selectedNode.selected = false;
        newNode.selected = true;
      }
    }
  }),
};

export const initialModel: GuiBuilderStoreModel = {
  configId: null,
  courseId: 0,

  initConfig: defaultConfig,
  editingConfig: defaultConfig,
  initPolicy: defaultPolicy,
  editingPolicy: defaultPolicy,
  initSchedule: defaultSchedule,
  editingSchedule: defaultSchedule,

  layout: {
    step: 0,
    accordion: {
      addNewStage: {
        preCompile: false,
        compile: false,
        testCases: false,
        miscStages: false,
      },
    },
  },

  pipelineEditor: {
    nodes: [],
    edges: [],
    shouldFitView: false,
  },

  ...baseActions,
  ...layoutActions,
  ...pipelineEditorActions,
};

const guiBuilderStore = createStore(initialModel);

export function GuiBuilderStoreProvider({ children }: { children: React.ReactNode }) {
  return <StoreProvider store={guiBuilderStore}>{children}</StoreProvider>;
}

export default guiBuilderStore;
