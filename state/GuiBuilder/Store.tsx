/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */
import { defaultConfig, defaultPolicy, defaultSchedule } from "@constants/Config/defaults";
import { SupportedStage } from "@constants/Config/supportedStages";
import type { Config, GradingPolicy, Schedule } from "@types";
import { isConfigEqual, isScheduleEqual } from "@utils/Config";
import { Action, action, computed, Computed } from "easy-peasy";
import isEqual from "lodash/isEqual";
import set from "lodash/set";
import cloneDeep from "lodash/cloneDeep";

/////////////// STORE DEFINITION ///////////////

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

  /** Page layout related states. */
  layout: GuiBuilderLayoutModel;

  /** Data being dragged from Add Stage panel. */
  dragging?: SupportedStage;
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

  toggleAddStage: Action<GuiBuilderStoreModel>;

  setDragging: Action<GuiBuilderStoreModel, SupportedStage | undefined>;
}

export interface GuiBuilderLayoutModel {
  /** Whether to show "Add New Stage" at right sidebar. */
  showAddStage: boolean;
}

/////////////// STORE IMPLEMENTATION ///////////////

const Actions: GuiBuilderStoreActions = {
  initializeConfig: action((state, payload) => {
    state.initConfig = payload.config;
    state.editingConfig = cloneDeep(payload.config);
    state.configId = payload.id;
  }),
  initializePolicy: action((state, payload) => {
    state.initPolicy = payload;
    state.editingPolicy = { ...payload };
  }),
  initializeSchedule: action((state, payload) => {
    state.initSchedule = payload;
    state.editingSchedule = { ...payload };
  }),

  updateField: action((state, payload) => {
    set(state.editingConfig, payload.path, payload.value);
  }),
  updatePolicy: action((state, payload) => {
    state.editingPolicy = payload;
  }),
  updateSchedule: action((state, payload) => {
    state.editingSchedule = payload;
  }),

  isEdited: computed((state) => {
    const isConfigEdited = !isConfigEqual(state.initConfig, state.editingConfig);
    const isPolicyEdited = !isEqual(state.initPolicy, state.editingPolicy);
    const isScheduleEdited = !isScheduleEqual(state.initSchedule, state.editingSchedule);
    return isConfigEdited || isPolicyEdited || isScheduleEdited;
  }),

  toggleAddStage: action((state) => {
    state.layout.showAddStage = !state.layout.showAddStage;
  }),

  setDragging: action((state, payload) => {
    state.dragging = payload;
  }),
};

// NOTE: The store should ONLY use plain serializable objects, arrays, and primitives.
// Do NOT use ES6 classes, functions, Maps, Sets, etc. Otherwise, easy-peasy will have
// trouble detecting changes in the store. See https://stackoverflow.com/q/74002866/11067496
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

  ...Actions,
};

export default configStore;
