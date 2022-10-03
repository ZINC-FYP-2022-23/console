/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */
import { Action, action, Computed, computed } from "easy-peasy";
import { Config } from "types";

export interface ConfigStoreModel {
  /** Initial configuration (e.g. when loaded from database) */
  initConfig?: Config;
  /** The config with proposed changes */
  editingConfig?: Config;
}

export interface ConfigStoreActions {
  initializeConfig: Action<ConfigStoreModel, Config>;
  generatedYaml: Computed<ConfigStoreModel, string>;
}

const Actions: ConfigStoreActions = {
  initializeConfig: action((state, payload) => {
    state.initConfig = payload;
    state.editingConfig = payload;
  }),

  generatedYaml: computed((state) => {
    return state.editingConfig?.toYaml() ?? "";
  }),
};

const configStore: ConfigStoreModel & ConfigStoreActions = {
  initConfig: undefined,
  editingConfig: undefined,
  ...Actions,
};

export default configStore;
