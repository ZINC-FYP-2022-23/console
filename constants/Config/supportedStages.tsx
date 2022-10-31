import { StageConfig, StageKind } from "@types";

export interface SupportedStage<TConfig = any> {
  /** Label to be shown in the UI. */
  readonly label: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Description to be shown in the UI. */
  readonly description: string;
  /** Default configuration of the stage. */
  readonly defaultConfig: TConfig;
}

export type SupportedStages = {
  [Stage in keyof StageConfig]: SupportedStage<StageConfig[Stage]>;
};

/**
 * Pipeline stages supported by the GUI Assignment Builder.
 */
const supportedStages: SupportedStages = {
  Compile: {
    label: "Compile",
    kind: StageKind.PRE_LOCAL,
    description: "Compiles source files to executable for grading",
    defaultConfig: {
      input: [],
    },
  },
  DiffWithSkeleton: {
    label: "Diff With Skeleton",
    kind: StageKind.PRE_GLOBAL,
    description: "Compares submission against skeleton file",
    defaultConfig: {
      exclude_from_provided: true,
    },
  },
  FileStructureValidation: {
    label: "File Structure Validation",
    kind: StageKind.PRE_GLOBAL,
    description: "Checks if the submitted filename tree follows specification",
    defaultConfig: {
      ignore_in_submission: [],
    },
  },
  Score: {
    label: "Score",
    kind: StageKind.POST,
    description: "Accumulates all scores from previous stages",
    defaultConfig: {},
  },
  StdioTest: {
    label: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades submissions against standard input/output using test cases",
    defaultConfig: {
      testCases: [],
    },
  },
};

export default supportedStages;
