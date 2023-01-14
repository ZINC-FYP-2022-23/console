/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */

import guiBuilderSteps, { GuiBuilderStep } from "@components/GuiBuilder/Steps/GuiBuilderSteps";
import { defaultConfig, defaultPolicy, defaultSchedule } from "@constants/GuiBuilder/defaults";
import supportedStages, { SupportedStage } from "@constants/GuiBuilder/supportedStages";
import type { Config, GradingPolicy, Schedule, Stage, StageNode } from "@types";
import { deleteStageFromDeps, isConfigEqual, isScheduleEqual, parseConfigYaml } from "@utils/GuiBuilder";
import { coordQuad, dagConnect, sugiyama } from "d3-dag";
import { Action, action, computed, Computed, createStore, StoreProvider, thunkOn, ThunkOn } from "easy-peasy";
import camelCase from "lodash/camelCase";
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
    /** Which modals are opened. */
    modal: ModalState;
    /** Value of the search bar in "Add New Stage" panel. */
    addStageSearchString: string;
    /** Whether the "Add New Stage" panel is collapsed. */
    isAddStageCollapsed: boolean;
  };

  pipelineEditor: {
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

  /** Updates a non-readonly field of the selected stage. */
  updateSelectedStage: Action<
    GuiBuilderStoreModel,
    {
      /**
       * Path to update the selected stage data. It is equal to `keyof Stage` but `readonly` keys
       * are filtered out.
       */
      path: "label" | "config";
      value: any;
    }
  >;

  /** Whether the config has been edited. */
  isEdited: Computed<GuiBuilderStoreModel, boolean>;
  /**
   * Returns a callback that check whether another stage with the same `stageName` (e.g. `"DiffWithSkeleton"`)
   * has a non-empty {@link Stage.label label} that is equal to the provided `label`.
   *
   * It always return `false` if the provided `label` is empty, since the UI allows two stages of the same
   * name to both have empty labels.
   */
  isStageLabelDuplicate: Computed<GuiBuilderStoreModel, (stageName: string, label: string) => boolean>;
  /** Whether the pipeline has a stage given its name. */
  hasStage: Computed<GuiBuilderStoreModel, (stageName: string) => boolean>;
}

/** Actions for {@link StoreStates.layout}. */
export interface LayoutActions {
  setStep: Action<GuiBuilderStoreModel, GuiBuilderStep["slug"]>;
  setAccordion: Action<
    GuiBuilderStoreModel,
    {
      /** Path to update the `accordion` state. */
      path: keyof AccordionState;
      value: string[];
    }
  >;
  setModal: Action<
    GuiBuilderStoreModel,
    {
      /** Path to update the `accordion` state. */
      path: keyof ModalState;
      value: boolean;
    }
  >;
  setAddStageSearchString: Action<GuiBuilderStoreModel, string>;
  toggleAddStageCollapsed: Action<GuiBuilderStoreModel>;
}

/** Actions for {@link StoreStates.pipelineEditor}. */
export interface PipelineEditorActions {
  /** Which stage is selected in the pipeline editor. */
  selectedStage: Computed<
    GuiBuilderStoreModel,
    {
      id: string;
      /** Stage name code (e.g. `"DiffWithSkeleton"`). */
      name: string;
      /** Stage name shown in UI (e.g. `"Diff With Skeleton"`). */
      nameInUI: string;
      /** Stage label. See {@link Stage.label}. */
      label: string;
    } | null
  >;

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
  setShouldFocusLabelInput: Action<GuiBuilderStoreModel, boolean>;
  setCopiedStageId: Action<GuiBuilderStoreModel, string | undefined>;

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
   * Deletes a stage node given its ID
   */
  deleteStageNode: Action<GuiBuilderStoreModel, string>;
  /**
   * Deletes a stage edge given its ID. It's called when the user presses "Backspace" after selecting the
   * stage edge or presses the red delete icon button.
   */
  deleteStageEdge: Action<GuiBuilderStoreModel, string>;

  /** Duplicates a stage given its ID. */
  duplicateStage: Action<GuiBuilderStoreModel, string>;
}

export interface AccordionState {
  /** Which accordion items are opened in Add New Stage panel. */
  addNewStage: ("preCompile" | "compile" | "grading" | "miscStages")[];
}

export interface ModalState {
  /** Delete stage confirmation modal in "Pipeline Stages" step. */
  deleteStage: boolean;
  /** Help information for stage label input box in "Pipeline Stages" step. */
  stageLabelInfo: boolean;
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

  updateSelectedStage: action((state, payload) => {
    const { path, value } = payload;
    const selectedStageId = state.selectedStage?.id;
    if (selectedStageId === undefined) {
      console.warn("No stage is selected while trying to update the selected stage's config.");
      return;
    }
    state.editingConfig.stageData[selectedStageId][path] = value;
  }),

  isEdited: computed((state) => {
    const isConfigEdited = !isConfigEqual(state.initConfig, state.editingConfig);
    const isPolicyEdited = !isEqual(state.initPolicy, state.editingPolicy);
    const isScheduleEdited = !isScheduleEqual(state.initSchedule, state.editingSchedule);
    return isConfigEdited || isPolicyEdited || isScheduleEdited;
  }),
  isStageLabelDuplicate: computed((state) => {
    return (stageName: string, label: string) => {
      if (label === "") return false;

      let hasProcessedItself = false;
      for (const stage of Object.values(state.editingConfig.stageData)) {
        if (stage.name === stageName && stage.label === label) {
          if (hasProcessedItself) return true;
          hasProcessedItself = true;
        }
      }
      return false;
    };
  }),
  hasStage: computed((state) => {
    return (stageName: string) =>
      Object.values(state.editingConfig.stageData).some((stage) => stage.name === stageName);
  }),
};

export const layoutActions: LayoutActions = {
  setStep: action((state, stepSlug) => {
    state.layout.step = guiBuilderSteps.findIndex((step) => step.slug === stepSlug);
  }),
  setAccordion: action((state, payload) => {
    set(state.layout.accordion, payload.path, payload.value);
  }),
  setModal: action((state, payload) => {
    state.layout.modal[payload.path] = payload.value;
  }),
  setAddStageSearchString: action((state, searchString) => {
    state.layout.addStageSearchString = searchString;
  }),
  toggleAddStageCollapsed: action((state) => {
    state.layout.isAddStageCollapsed = !state.layout.isAddStageCollapsed;
  }),
};

export const pipelineEditorActions: PipelineEditorActions = {
  selectedStage: computed((state) => {
    const selectedNode = state.pipelineEditor.nodes.find((node) => node.selected);
    if (selectedNode === undefined) {
      return null;
    }

    const id = selectedNode.id;
    const selectedStageData: Stage<any> | undefined = state.editingConfig.stageData[id];
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
          label: stageMetadata?.nameInUI ?? stage.name,
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
  setShouldFocusLabelInput: action((state, shouldFocusLabelInput) => {
    state.pipelineEditor.shouldFocusLabelInput = shouldFocusLabelInput;
  }),
  setCopiedStageId: action((state, stageId) => {
    state.pipelineEditor.copiedStageId = stageId;
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
      data: { name: dragging.stageName, label: dragging.stageData.nameInUI },
      type: "stage",
    };
    state.pipelineEditor.nodes = state.pipelineEditor.nodes.concat(newNode);

    // Update `editingConfig`
    state.editingConfig.stageDeps[stageId] = [];
    state.editingConfig.stageData[stageId] = {
      name: dragging.stageName,
      label: "",
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
    state.editingConfig.stageDeps = deleteStageFromDeps(id, state.editingConfig.stageDeps);
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

  duplicateStage: action((state, sourceId) => {
    const sourceData: Stage | undefined = state.editingConfig.stageData[sourceId];
    const sourceNode = state.pipelineEditor.nodes.find((node) => node.id === sourceId);

    if (sourceData === undefined || sourceNode === undefined) {
      console.warn(`Failed to duplicate stage of id '${sourceId}' because it does not exist.`);
      return;
    }

    // Duplicate stage data in `editingConfig`
    const targetId = uuidv4();
    const targetData = cloneDeep(sourceData);
    targetData.label = camelCase(targetData.label + "Copy");
    state.editingConfig.stageData[targetId] = targetData;
    state.editingConfig.stageDeps[targetId] = [];

    // Duplicate React Flow node
    const targetNode = cloneDeep(sourceNode);
    targetNode.id = targetId;
    targetNode.position.y += (targetNode.height || 50) * 1.5; // Place below the source node
    state.pipelineEditor.nodes.push(targetNode);

    // Select the newly duplicated stage
    state.pipelineEditor.nodes.forEach((node) => (node.selected = false));
    targetNode.selected = true;
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
      addNewStage: [],
    },
    modal: {
      deleteStage: false,
      stageLabelInfo: false,
    },
    addStageSearchString: "",
    isAddStageCollapsed: false,
  },

  pipelineEditor: {
    nodes: [],
    edges: [],
    shouldFitView: false,
    shouldFocusLabelInput: false,
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
