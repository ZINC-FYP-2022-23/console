import { BoardingStepDefinition } from "boarding.js/dist/boarding-types";

/**
 * IDs for the HTML elements that can be highlighted.
 *
 * By storing the IDs in a map, we can avoid hard-coding the IDs in the component code.
 */
export const highlightableElementIds = {
  addStagePanel: "add-stage-panel",
  generateExpectedOutput: "generate-expected-output",
  pipelineEditor: "pipeline-editor",
  useTemplateWrapper: "use-template-wrapper",
  useGeneratedWrapper: "use-generated-wrapper",
} as const;

/** Keys of the {@link highlightableElements} map. */
export type HighlightableElementsKey = "addStageTutorial" | "generateExpectedOutput" | "useTemplate" | "useGenerated";

/**
 * There are 2 modes of highlighting (specified by the `mode` property):
 *  - `single`: highlight a single element on the page.
 *  - `multi`: create a multi-step highlighting sequence.
 */
type HighlightableElementsValue =
  | Readonly<{
      /** The highlighting mode for highlighting a single element. */
      mode: "single";
      /**
       * The selector for the element to highlight.
       *
       * See the {@link https://josias-r.github.io/boarding.js/#single-element-with-popover Boarding.js docs}
       * for more details.
       */
      selector: BoardingStepDefinition;
    }>
  | Readonly<{
      /** The highlighting mode for creating a multi-step highlighting sequence. */
      mode: "multiple";
      /**
       * Sequences of steps to highlight different elements.
       *
       * See the {@link https://josias-r.github.io/boarding.js/#run-multi-element-popovers example in Boarding.js docs}.
       */
      steps: BoardingStepDefinition[];
    }>;

type HighlightableElements = Record<HighlightableElementsKey, HighlightableElementsValue>;

/**
 * A map of highlightable elements in the GUI Assignment Builder.
 *
 * We can "highlight" an element on the page by dimming the rest of the page except for the element.
 * This is useful for guiding the user to a specific element on the page.
 *
 * {@link https://josias-r.github.io/boarding.js/ Boarding.js} is used as the highlighting engine.
 */
const highlightableElements: HighlightableElements = {
  addStageTutorial: {
    mode: "multiple",
    steps: [
      {
        element: `#${highlightableElementIds.addStagePanel}`,
        popover: {
          title: "Add New Stage Panel (1/3)",
          description: "It contains different stage blocks that you can add to your grading pipeline.",
        },
      },
      {
        element: `#${highlightableElementIds.pipelineEditor}`,
        popover: {
          title: "Pipeline Editor Canvas (2/3)",
          description:
            "This is where you place the stage blocks. You can connect different stage blocks together to specify the stage execution order.",
        },
      },
      {
        element: `#${highlightableElementIds.addStagePanel}`,
        popover: {
          title: "Try It! (3/3)",
          description:
            "Press 'Done' to end the tutorial, and try dragging a stage block from this panel to the canvas at the left!",
        },
      },
    ],
  },
  generateExpectedOutput: {
    mode: "single",
    selector: {
      element: `#${highlightableElementIds.generateExpectedOutput}`,
    },
  },
  useTemplate: {
    mode: "single",
    selector: {
      element: `#${highlightableElementIds.useTemplateWrapper}`,
    },
  },
  useGenerated: {
    mode: "single",
    selector: {
      element: `#${highlightableElementIds.useGeneratedWrapper}`,
    },
  },
};

export default highlightableElements;
