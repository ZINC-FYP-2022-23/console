/**
 * @file Hooks for the GUI Assignment Builder page.
 */
import { createTypedHooks } from "easy-peasy";
import { ConfigStoreActions, ConfigStoreModel } from "./Store";

/**
 * Typed Easy Peasy hooks ({@link https://easy-peasy.vercel.app/docs/tutorials/typescript.html#typing-the-hooks Docs}).
 */
const typedHooks = createTypedHooks<ConfigStoreModel & ConfigStoreActions>();
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
