/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */

import { defaultConfig, defaultPolicy, defaultSchedule } from "@constants/Config/defaults";
import { SupportedStage } from "@constants/Config/supportedStages";
import type { Config, GradingPolicy, Schedule, StageNodeData } from "@types";
import { isConfigEqual, isScheduleEqual } from "@utils/Config";
import { Action, action, computed, Computed } from "easy-peasy";
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
  Node,
  NodeChange,
} from "reactflow";

/////////////// STORE DEFINITION ///////////////

// NOTE: The store should ONLY use plain serializable objects, arrays, and primitives.
// Do NOT use ES6 classes, functions, Maps, Sets, etc. Otherwise, easy-peasy will have
// trouble detecting changes in the store. See https://stackoverflow.com/q/74002866/11067496

export interface GuiBuilderStoreModel {
  /** The assignment config ID. It's `null` if we're creating a new assignment. */
  configId: number | null;

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
    /** Whether to show "Add New Stage" at right sidebar. */
    showAddStage: boolean;
  };

  pipelineEditor: {
    /** Data being dragged from Add Stage panel. */
    dragging?: SupportedStage;
    /** Pipeline stage nodes. */
    nodes: Node<StageNodeData>[];
    /** Edges that connect pipeline stage nodes. */
    edges: Edge[];
  };
}

export interface GuiBuilderStoreActions {
  initializeConfig: Action<GuiBuilderStoreModel, { config: Config; id: number | null }>;
  initializePolicy: Action<GuiBuilderStoreModel, GradingPolicy>;
  initializeSchedule: Action<GuiBuilderStoreModel, Schedule>;

  /** Updates a field in `editingConfig` given its `path`. */
  updateField: Action<GuiBuilderStoreModel, { path: string; value: any }>;
  updatePolicy: Action<GuiBuilderStoreModel, GradingPolicy>;
  updateSchedule: Action<GuiBuilderStoreModel, Schedule>;

  /** Whether the config has been edited. */
  isEdited: Computed<GuiBuilderStoreModel, boolean>;

  //////// Layout actions ////////

  toggleAddStage: Action<GuiBuilderStoreModel>;

  //////// Pipeline editor actions ////////

  setDragging: Action<GuiBuilderStoreModel, SupportedStage | undefined>;
  setStageNodes: Action<GuiBuilderStoreModel, Node<StageNodeData>[]>;
  setStageEdges: Action<GuiBuilderStoreModel, Edge[]>;
  /** Called on drag, select and remove of stage nodes. */
  onStageNodesChange: Action<GuiBuilderStoreModel, NodeChange[]>;
  /** Called on select and remove of stage edges. */
  onStageEdgesChange: Action<GuiBuilderStoreModel, EdgeChange[]>;
  /** Called when user connects two stage nodes. */
  onStageConnect: Action<GuiBuilderStoreModel, Connection>;
  /** Deletes a stage node given its ID. */
  deleteStageNode: Action<GuiBuilderStoreModel, string>;
  /** Deletes a stage edge given its ID. */
  deleteStageEdge: Action<GuiBuilderStoreModel, string>;
}

/////////////// STORE IMPLEMENTATION ///////////////

const Actions: GuiBuilderStoreActions = {
  initializeConfig: action((state, payload) => {
    state.initConfig = payload.config;
    state.editingConfig = cloneDeep(payload.config);
    state.configId = payload.id;
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

  //////// Layout actions ////////

  toggleAddStage: action((state) => {
    state.layout.showAddStage = !state.layout.showAddStage;
  }),

  //////// Pipeline editor actions ////////

  setDragging: action((state, supportedStage) => {
    state.pipelineEditor.dragging = supportedStage;
  }),
  setStageNodes: action((state, nodes) => {
    state.pipelineEditor.nodes = nodes;
  }),
  setStageEdges: action((state, edges) => {
    state.pipelineEditor.edges = edges;
  }),
  onStageNodesChange: action((state, changes) => {
    state.pipelineEditor.nodes = applyNodeChanges(changes, state.pipelineEditor.nodes);
  }),
  onStageEdgesChange: action((state, changes) => {
    state.pipelineEditor.edges = applyEdgeChanges(changes, state.pipelineEditor.edges);
  }),
  onStageConnect: action((state, connection) => {
    state.pipelineEditor.edges = addEdge(connection, state.pipelineEditor.edges);
  }),
  deleteStageNode: action((state, id) => {
    const node = state.pipelineEditor.nodes.find((node) => node.id === id)!;
    const connectedEdges = getConnectedEdges([node], state.pipelineEditor.edges);
    const edgesToRemove: EdgeRemoveChange[] = connectedEdges.map((edge) => ({
      id: edge.id,
      type: "remove",
    }));

    // Remove the node and any edges connected to it
    state.pipelineEditor.nodes = applyNodeChanges([{ id: node.id, type: "remove" }], state.pipelineEditor.nodes);
    state.pipelineEditor.edges = applyEdgeChanges(edgesToRemove, state.pipelineEditor.edges);
  }),
  deleteStageEdge: action((state, id) => {
    state.pipelineEditor.edges = applyEdgeChanges([{ id, type: "remove" }], state.pipelineEditor.edges);
  }),
};

const configStore: GuiBuilderStoreModel & GuiBuilderStoreActions = {
  configId: null,

  initConfig: defaultConfig,
  editingConfig: defaultConfig,
  initPolicy: defaultPolicy,
  editingPolicy: defaultPolicy,
  initSchedule: defaultSchedule,
  editingSchedule: defaultSchedule,

  layout: {
    showAddStage: false,
  },

  pipelineEditor: {
    nodes: [],
    edges: [],
  },

  ...Actions,
};

export default configStore;
