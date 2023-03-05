import guiBuilderSteps, { GuiBuilderStepSlug } from "@/components/GuiBuilder/Steps/GuiBuilderSteps";
import { HighlightableElementsKey } from "@/constants/GuiBuilder/highlightableElements";
import { action, Action } from "easy-peasy";
import set from "lodash/set";

// #region Model Definition

/**
 * Model for the layout-related states in the GUI Assignment Builder.
 */
export type LayoutModel = LayoutModelState & LayoutModelAction;

interface LayoutModelState {
  /** Zero-based index of which step the user is in. */
  step: number;
  /** Which accordion components are opened. */
  accordion: AccordionState;
  /** Which alerts are shown. */
  alert: AlertState;
  /** Which modals are opened. */
  modal: ModalState;
  /** Value of the search bar in "Add New Stage" panel. */
  addStageSearchString: string;
  /** Whether the "Add New Stage" panel is collapsed. */
  isAddStageCollapsed: boolean;
  /** Which element on the page should be highlighted. */
  elementToHighlight?: HighlightableElementsKey;
}

interface LayoutModelAction {
  setStep: Action<LayoutModel, GuiBuilderStepSlug>;
  setAccordion: Action<
    LayoutModel,
    {
      /** Path to update the `accordion` state. */
      path: keyof AccordionState;
      value: string[];
    }
  >;
  setAlert: Action<
    LayoutModel,
    {
      /** Path to update the `alert` state. */
      path: keyof AlertState;
      value: boolean;
    }
  >;
  setModal: Action<
    LayoutModel,
    {
      /** Path to update the `accordion` state. */
      path: keyof ModalState;
      value: boolean;
    }
  >;
  setAddStageSearchString: Action<LayoutModel, string>;
  toggleAddStageCollapsed: Action<LayoutModel>;
  setElementToHighlight: Action<LayoutModel, HighlightableElementsKey | undefined>;
}

export interface AccordionState {
  /** Which accordion items are opened in Add New Stage panel. */
  addNewStage: ("preCompile" | "compile" | "grading" | "miscStages")[];
}

export interface AlertState {
  /** Warning that the stage is unsupported. */
  unsupportedStage: boolean;
}

export interface ModalState {
  /** Modal that teaches how to create a connection between two nodes. */
  connectNodesTutorial: boolean;
  /** Success modal after creating a new config. */
  configCreated: boolean;
  /** Delete stage confirmation modal in "Pipeline Stages" step. */
  deleteStage: boolean;
  /** Regrade prompt modal after saving a change in the pipeline config. */
  regradePrompt: boolean;
  /** Help information for stage label input box in "Pipeline Stages" step. */
  stageLabelInfo: boolean;
}

// #endregion

// #region Model Implementation

const layoutModelState: LayoutModelState = {
  step: 0,
  accordion: {
    addNewStage: ["preCompile", "compile", "grading", "miscStages"],
  },
  alert: {
    unsupportedStage: true,
  },
  modal: {
    connectNodesTutorial: false,
    configCreated: false,
    deleteStage: false,
    regradePrompt: false,
    stageLabelInfo: false,
  },
  addStageSearchString: "",
  isAddStageCollapsed: false,
};

const layoutModelAction: LayoutModelAction = {
  setStep: action((state, stepSlug) => {
    state.step = guiBuilderSteps.findIndex((step) => step.slug === stepSlug);
  }),
  setAccordion: action((state, payload) => {
    set(state.accordion, payload.path, payload.value);
  }),
  setAlert: action((state, payload) => {
    state.alert[payload.path] = payload.value;
  }),
  setModal: action((state, payload) => {
    state.modal[payload.path] = payload.value;
  }),
  setAddStageSearchString: action((state, searchString) => {
    state.addStageSearchString = searchString;
  }),
  toggleAddStageCollapsed: action((state) => {
    state.isAddStageCollapsed = !state.isAddStageCollapsed;
  }),
  setElementToHighlight: action((state, elementKey) => {
    state.elementToHighlight = elementKey;
  }),
};

export const layoutModel: LayoutModel = {
  ...layoutModelState,
  ...layoutModelAction,
};

// #endregion
