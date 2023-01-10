import { Spinner } from "@components/Spinner";
import {
  CompileRaw,
  FileStructureValidation,
  StageConfig,
  StageKind,
  StdioTestRaw,
  TestCaseRaw,
  Valgrind,
  ValgrindRaw,
} from "@types";
import { testCaseFromRaw, testCaseToRaw, valgrindFromRaw, valgrindToRaw } from "@utils/Config/stageConfig";
import dynamic from "next/dynamic";
import { ComponentType } from "react";

export interface SupportedStage<TConfig = any> {
  /** Label to be shown in the UI. */
  readonly nameInUI: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Description to be shown in the UI. */
  readonly description: string;
  /** Default configuration to use when a new stage is created. */
  readonly defaultConfig: TConfig;
  /**
   * @param raw The raw stage config object obtained from parsing the YAML.
   * @returns A tidied stage config object. Its shape can differ from the `raw` parameter to
   * facilitate GUI implementation.
   */
  readonly configFromRaw?: (raw: any) => TConfig;
  /**
   * @param config The stage config object to be converted to raw.
   * @returns A raw stage config object to be de-serialized to YAML.
   */
  readonly configToRaw?: (config: TConfig) => any;
  /**
   * Stage settings panel component. It should be dynamically imported to reduce the initial bundle size.
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
 * Default config values for Valgrind stage.
 * ({@link https://docs.zinc.ust.dev/user/pipeline/docker/Valgrind.html Reference}).
 */
export const valgrindDefaultConfig: Valgrind = {
  enabled: true,
  checksFilter: ["*"],
  visibility: "INHERIT",
};

/**
 * Pipeline stages supported by the GUI Assignment Builder.
 */
const supportedStages: SupportedStages = {
  Compile: {
    nameInUI: "Compile",
    kind: StageKind.PRE_LOCAL,
    description: "Compiles source files to executable for grading",
    defaultConfig: {
      input: [],
      additional_packages: [],
    },
    configFromRaw: (raw: CompileRaw) => ({
      ...raw,
      flags: raw.flags?.join(" "),
      additional_packages: raw.additional_packages ?? [],
    }),
    configToRaw: (config): CompileRaw => ({
      ...config,
      output: config.output?.trim(),
      flags: config.flags
        ?.trim()
        .split(" ")
        .filter((flag) => flag !== ""),
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/CompileSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  DiffWithSkeleton: {
    nameInUI: "Diff With Skeleton",
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
    nameInUI: "File Structure Validation",
    kind: StageKind.PRE_GLOBAL,
    description: "Checks if the submission follows the specified file structure",
    defaultConfig: {
      ignore_in_submission: [],
    },
    configToRaw: (config): FileStructureValidation => ({
      ignore_in_submission: config.ignore_in_submission?.map((path) => path.trim()).filter((path) => path !== ""),
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/FileStructureValidationSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  Score: {
    nameInUI: "Score",
    kind: StageKind.POST,
    description: "Accumulates all scores from previous stages",
    defaultConfig: {
      normalizedTo: undefined,
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ScoreSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  StdioTest: {
    nameInUI: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades an executable's standard output against test cases",
    defaultConfig: {
      testCases: [],
      diff_ignore_flags: [],
      additional_packages: [],
      additional_pip_packages: [],
    },
    configFromRaw: (raw: StdioTestRaw) => ({
      testCases: raw.testCases.sort((a, b) => a.id - b.id).map((testCase) => testCaseFromRaw(testCase)),
      diff_ignore_flags: raw.diff_ignore_flags ?? [],
      additional_packages: raw.additional_packages ?? [],
      additional_pip_packages: raw.additional_pip_packages ?? [],
    }),
    configToRaw: (config): StdioTestRaw => ({
      ...config,
      testCases: config.testCases.sort((a, b) => a.id - b.id).map((test): TestCaseRaw => testCaseToRaw(test)),
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/StdioTestSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  Valgrind: {
    nameInUI: "Valgrind",
    kind: StageKind.GRADING,
    description: "Memory checking with Valgrind",
    defaultConfig: valgrindDefaultConfig,
    configFromRaw: (raw: ValgrindRaw) => valgrindFromRaw(raw),
    configToRaw: (config): ValgrindRaw => valgrindToRaw(config),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ValgrindSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
};

export default supportedStages;
