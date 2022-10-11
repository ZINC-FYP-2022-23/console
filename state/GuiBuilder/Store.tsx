/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */
import { defaultConfig } from "constants/Config/defaults";
import { Action, action, computed, Computed } from "easy-peasy";
import { set } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import type { Config } from "types";
import { isConfigEqual } from "utils/Config";

export interface GuiBuilderStoreModel {
  /** The assignment config ID. It's `null` if we're creating a new assignment. */
  configId: number | null;
  /** Initial configuration (e.g. when loaded from database). It should be immutable after initialization. */
  initConfig: Config;
  /** The config with proposed changes. */
  editingConfig: Config;

  /** Page layout related states. */
  layout: GuiBuilderLayoutModel;
}

export interface GuiBuilderStoreActions {
  initializeConfig: Action<GuiBuilderStoreModel, { config: Config; id: number | null }>;
  /** Updates a field in `editingConfig` given its `path`. */
  updateField: Action<GuiBuilderStoreModel, { path: string; value: any }>;
  /** Whether the config has been edited. */
  isEdited: Computed<GuiBuilderStoreModel, boolean>;

  toggleAddStage: Action<GuiBuilderStoreModel>;
}

export interface GuiBuilderLayoutModel {
  /** Whether to show "Add New Stage" at right sidebar. */
  showAddStage: boolean;
}

const Actions: GuiBuilderStoreActions = {
  initializeConfig: action((state, payload) => {
    state.initConfig = payload.config;
    state.editingConfig = cloneDeep(payload.config);
    state.configId = payload.id;
  }),
  updateField: action((state, payload) => {
    set(state.editingConfig, payload.path, payload.value);
  }),
  isEdited: computed((state) => !isConfigEqual(state.initConfig, state.editingConfig)),

  toggleAddStage: action((state) => {
    state.layout.showAddStage = !state.layout.showAddStage;
  }),
};

// NOTE: The store should ONLY use plain serializable objects, arrays, and primitives.
// Do NOT use ES6 classes, functions, Maps, Sets, etc. Otherwise, easy-peasy will have
// trouble detecting changes in the store. See https://stackoverflow.com/q/74002866/11067496
const configStore: GuiBuilderStoreModel & GuiBuilderStoreActions = {
  configId: null,
  initConfig: defaultConfig,
  editingConfig: defaultConfig,

  layout: {
    showAddStage: false,
  },

  ...Actions,
};

export default configStore;
