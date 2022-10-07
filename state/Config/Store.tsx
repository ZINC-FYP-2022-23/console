/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */
import { Action, action } from "easy-peasy";
import { set } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import { Config } from "types";

export interface ConfigStoreModel {
  /** The assignment config ID. It's `null` if we're creating a new assignment. */
  configId: number | null;
  /** Initial configuration (e.g. when loaded from database). It should be immutable after initialization. */
  initConfig: Config;
  /** The config with proposed changes. */
  editingConfig: Config;
}

export interface ConfigStoreActions {
  initializeConfig: Action<ConfigStoreModel, { config: Config; id: number | null }>;
  /** Updates a field in `editingConfig` given its `path`. */
  updateField: Action<ConfigStoreModel, { path: string; value: any }>;
}

const Actions: ConfigStoreActions = {
  initializeConfig: action((state, payload) => {
    state.initConfig = payload.config;
    state.editingConfig = cloneDeep(payload.config);
    state.configId = payload.id;
  }),

  updateField: action((state, payload) => {
    set(state.editingConfig, payload.path, payload.value);
  }),
};

const configStore: ConfigStoreModel & ConfigStoreActions = {
  configId: null,
  initConfig: Config.empty(),
  editingConfig: Config.empty(),
  ...Actions,
};

export default configStore;
