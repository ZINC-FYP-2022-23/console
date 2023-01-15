import { createTypedHooks } from "easy-peasy";
import { configModel, ConfigModel } from "./model/configModel";
import { layoutModel, LayoutModel } from "./model/layoutModel";
import { pipelineEditorModel, PipelineEditorModel } from "./model/pipelineEditorModel";

/**
 * Store model for the GUI Assignment Builder. It uses {@link https://easy-peasy.dev/ Easy Peasy} as the
 * state management library.
 *
 * It's strongly recommended to only store plain objects, arrays, and primitives in the store. See
 * {@link https://stackoverflow.com/q/74002866/11067496 this Stack Overflow post} for more details.
 */
export interface GuiBuilderModel {
  config: ConfigModel;
  layout: LayoutModel;
  pipelineEditor: PipelineEditorModel;
}

export const guiBuilderModel: GuiBuilderModel = {
  config: configModel,
  layout: layoutModel,
  pipelineEditor: pipelineEditorModel,
};

/**
 * Typed Easy Peasy hooks ({@link https://easy-peasy.dev/docs/tutorials/typescript.html#typing-the-hooks Docs}).
 */
const typedHooks = createTypedHooks<GuiBuilderModel>();
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
export const useStore = typedHooks.useStore;
