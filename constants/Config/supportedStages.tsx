import { Spinner } from "@components/Spinner";
import {
  CompileRaw,
  FileStructureValidation,
  ScoreRaw,
  StageConfig,
  StageKind,
  StdioTestRaw,
  TestCase,
  TestCaseRaw,
} from "@types";
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
 * Pipeline stages supported by the GUI Assignment Builder.
 */
const supportedStages: SupportedStages = {
  Compile: {
    label: "Compile",
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
      additional_packages: config.additional_packages.length ? config.additional_packages : undefined,
    }),
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
    configToRaw: (config): FileStructureValidation => ({
      ignore_in_submission: config.ignore_in_submission?.length
        ? config.ignore_in_submission.map((path) => path.trim()).filter((path) => path !== "")
        : undefined,
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/FileStructureValidationSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  Score: {
    label: "Score",
    kind: StageKind.POST,
    description: "Accumulates all scores from previous stages",
    defaultConfig: {
      normalizedTo: "",
      minScore: "",
      maxScore: "",
    },
    configFromRaw: (raw: ScoreRaw) => ({
      normalizedTo: raw.normalizedTo?.toString() ?? "",
      minScore: raw.minScore?.toString() ?? "",
      maxScore: raw.maxScore?.toString() ?? "",
    }),
    configToRaw: (config): ScoreRaw => ({
      normalizedTo: config.normalizedTo ? parseFloat(config.normalizedTo) : undefined,
      minScore: config.minScore ? parseFloat(config.minScore) : undefined,
      maxScore: config.maxScore ? parseFloat(config.maxScore) : undefined,
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ScoreSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  StdioTest: {
    label: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades an executable's standard output against test cases",
    defaultConfig: {
      testCases: [],
      diff_ignore_flags: [],
      additional_packages: [],
      additional_pip_packages: [],
    },
    configFromRaw: (raw: StdioTestRaw) => ({
      testCases: raw.testCases
        .sort((a, b) => a.id - b.id)
        .map(
          (test): TestCase => ({
            ...test,
            score: test.score?.toString() ?? "",
            args: test.args?.join(" "),

            // Helper fields
            _stdinInputMode: (() => {
              if (!test.stdin && !test.file_stdin) return "none";
              return test.stdin ? "text" : "file";
            })(),
            _expectedInputMode: (() => {
              if (!test.expected && !test.file_expected) return "none";
              return test.expected ? "text" : "file";
            })(),
          }),
        ),
      diff_ignore_flags: raw.diff_ignore_flags ?? [],
      additional_packages: raw.additional_packages ?? [],
      additional_pip_packages: raw.additional_pip_packages ?? [],
    }),
    configToRaw: (config): StdioTestRaw => ({
      ...config,
      testCases: config.testCases.map((test): TestCaseRaw => {
        const { _stdinInputMode, _expectedInputMode, ...testRest } = test;
        return {
          ...testRest,
          score: test.score ? parseFloat(test.score) : undefined,
          args: test.args
            ?.trim()
            .split(" ")
            .filter((arg) => arg !== ""),
          stdin: _stdinInputMode === "text" ? test.stdin : undefined,
          file_stdin: _stdinInputMode === "file" ? test.file_stdin : undefined,
          expected: _expectedInputMode === "text" ? test.expected : undefined,
          file_expected: _expectedInputMode === "file" ? test.file_expected : undefined,
        };
      }),
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/StdioTestSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
};

export default supportedStages;
