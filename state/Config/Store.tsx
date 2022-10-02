/**
 * @file Store for the GUI Assignment Builder.
 *
 * {@link https://easy-peasy.vercel.app/ easy-peasy} is chosen as the state management library.
 */
import { Action, action } from "easy-peasy";
import { Config } from "types";

export interface StoreModel {
  /** Initial configuration (e.g. when loaded from database) */
  initConfig?: Config;
  /** The config with proposed changes */
  editingConfig?: Config;
}

export interface StoreActions {}

const Actions: StoreActions = {};

const Store: StoreModel & StoreActions = {
  initConfig: undefined,
  editingConfig: undefined,
  ...Actions,
};

export default Store;
