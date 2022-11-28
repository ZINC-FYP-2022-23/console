import { Spinner } from "@components/Spinner";
import { StageConfig, StageKind } from "@types";
import dynamic from "next/dynamic";
import { ComponentType } from "react";

export interface SupportedStage<TConfig = any> {
  /** Label to be shown in the UI. */
  readonly label: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Description to be shown in the UI. */
  readonly description: string;
  /** Default configuration of the stage. */
  readonly defaultConfig: TConfig;
  /**
   * Stage settings panel component.
   *
   * It should be dynamically imported to reduce the initial bundle size.
   */
  readonly stageSettings: ComponentType<{}>;
}

export type SupportedStages = {
  [Stage in keyof StageConfig]: SupportedStage<StageConfig[Stage]>;
};

const StageSettingsLoading = () => (
  <div className="my-20 flex flex-col items-center justify-center">
    <Spinner className="h-14 w-14 text-cse-500" />
  </div>
);

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
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/CompileSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  DiffWithSkeleton: {
    label: "Diff With Skeleton",
    kind: StageKind.PRE_GLOBAL,
    description: "Diff submission against skeleton files",
    defaultConfig: {
      exclude_from_provided: true,
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/DiffWithSkeletonSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  FileStructureValidation: {
    label: "File Structure Validation",
    kind: StageKind.PRE_GLOBAL,
    description: "Checks if the submission follows the specified file structure",
    defaultConfig: {
      ignore_in_submission: [],
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/FileStructureValidationSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  Score: {
    label: "Score",
    kind: StageKind.POST,
    description: "Accumulates all scores from previous stages",
    defaultConfig: {},
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ScoreSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  StdioTest: {
    label: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades submissions against standard input/output using test cases",
    defaultConfig: {
      testCases: [],
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/StdioTestSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
};

export default supportedStages;
