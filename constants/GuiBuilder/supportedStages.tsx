import { Spinner } from "@/components/Spinner";
import {
  CompileRaw,
  FileStructureValidation,
  MakeRaw,
  PyTestRaw,
  ShellExecRaw,
  StageConfig,
  StageKind,
  StdioTestRaw,
  TestCaseRaw,
  ValgrindRaw,
} from "@/types/GuiBuilder";
import {
  scoreWeightingFromRaw,
  scoreWeightingToRaw,
  splitStringToArray,
  testCaseFromRaw,
  testCaseToRaw,
  valgrindFromRaw,
  valgrindToRaw,
} from "@/utils/GuiBuilder/stageRawConfig";
import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { defaultScoreWeightingXUnit, defaultTotalScorableScore, defaultValgrindConfig } from "./defaults";

export type SupportedStage<TConfig = any> = Readonly<{
  /** Label to be shown in the UI. */
  nameInUI: string;
  /** Stage kind. */
  kind: StageKind;
  /** Description to be shown in the UI. */
  description: string;
  /** Default configuration to use when a new stage is created. */
  defaultConfig: TConfig;
  /**
   * @param raw The raw stage config object obtained from parsing the YAML.
   * @returns A tidied stage config object. Its shape can differ from the `raw` parameter to
   * facilitate GUI implementation.
   */
  configFromRaw?: (raw: any) => TConfig;
  /**
   * @param config The stage config object to be converted to raw.
   * @returns A raw stage config object to be de-serialized to YAML.
   */
  configToRaw?: (config: TConfig) => any;
  /**
   * Stage settings panel component. It should be dynamically imported to reduce the initial bundle size.
   */
  stageSettings: ComponentType<{}>;
}>;

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
      flags: splitStringToArray(config.flags),
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
  Make: {
    nameInUI: "Make",
    kind: StageKind.PRE_LOCAL,
    description: "Builds executables using GNU Make",
    defaultConfig: {
      targets: [],
      args: "",
      additional_packages: [],
    },
    configFromRaw: (raw: MakeRaw) => ({
      targets: raw.targets ?? [],
      args: raw.args?.join(" ") ?? "",
      additional_packages: raw.additional_packages ?? [],
    }),
    configToRaw: (config): MakeRaw => ({
      ...config,
      args: splitStringToArray(config.args),
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/MakeSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  PyTest: {
    nameInUI: "PyTest",
    kind: StageKind.GRADING,
    description: "Grades Python programs with PyTest framework",
    defaultConfig: {
      args: "",
      additional_pip_packages: [],
      _scorePolicy: "total",
      score: defaultTotalScorableScore,
      scoreWeighting: defaultScoreWeightingXUnit,
    },
    configFromRaw: (raw: PyTestRaw) => {
      const { args, additional_pip_packages, score, scoreWeighting, ..._raw } = raw;
      return {
        ..._raw,
        args: args?.join(" ") ?? "",
        additional_pip_packages: additional_pip_packages ?? [],
        _scorePolicy: (() => {
          if (scoreWeighting) return "weighted";
          if (score) return "total";
          return "disable";
        })(),
        // Populate score fields with default values no matter what score policy is used. These values
        // will be appropriately discarded when converting the config back to raw.
        score: score ?? defaultTotalScorableScore,
        scoreWeighting: scoreWeighting ? scoreWeightingFromRaw(scoreWeighting) : defaultScoreWeightingXUnit,
      };
    },
    configToRaw: (config): PyTestRaw => {
      const { _scorePolicy, score, treatDenormalScore, scoreWeighting, ..._config } = config;
      return {
        ..._config,
        args: splitStringToArray(_config.args),
        ...(_scorePolicy === "total" && { score, treatDenormalScore }),
        ...(_scorePolicy === "weighted" && { scoreWeighting: scoreWeightingToRaw(scoreWeighting) }),
      };
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/PyTestSettings"), {
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
  ShellExec: {
    nameInUI: "Shell Command",
    kind: StageKind.CONSTANT,
    description: "Executes an arbitrary shell command",
    defaultConfig: {
      cmd: "",
      additional_packages: [],
    },
    configFromRaw: (raw: ShellExecRaw) => ({
      ...raw,
      additional_packages: raw.additional_packages ?? [],
    }),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ShellExecSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  StdioTest: {
    nameInUI: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades an executable's standard output against test cases",
    defaultConfig: {
      testCases: [],
      diff_ignore_flags: ["TRAILING_WHITESPACE"],
      additional_packages: [],
      additional_pip_packages: [],
      experimentalModularize: false,
      generate_expected_output: false,
    },
    configFromRaw: (raw: StdioTestRaw) => ({
      testCases: raw.testCases.sort((a, b) => a.id - b.id).map((testCase) => testCaseFromRaw(testCase)),
      diff_ignore_flags: raw.diff_ignore_flags ?? [],
      additional_packages: raw.additional_packages ?? [],
      additional_pip_packages: raw.additional_pip_packages ?? [],
      experimentalModularize: raw.experimentalModularize ?? false,
      generate_expected_output: raw.generate_expected_output ?? false,
    }),
    configToRaw: (config): StdioTestRaw => {
      const configRaw: StdioTestRaw = {
        ...config,
        testCases: config.testCases.sort((a, b) => a.id - b.id).map((test): TestCaseRaw => testCaseToRaw(test)),
      };
      if (config.generate_expected_output) {
        // Discards `expected` and `file_expected` in each test case
        configRaw.testCases = configRaw.testCases.map((test) => {
          const { expected, file_expected, ..._test } = test;
          return _test;
        });
        configRaw.experimentalModularize = true;
      }

      return configRaw;
    },
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/StdioTestSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
  Valgrind: {
    nameInUI: "Valgrind",
    kind: StageKind.GRADING,
    description: "Memory checking with Valgrind",
    defaultConfig: defaultValgrindConfig,
    configFromRaw: (raw: ValgrindRaw) => valgrindFromRaw(raw),
    configToRaw: (config): ValgrindRaw => valgrindToRaw(config),
    stageSettings: dynamic(() => import("../../components/GuiBuilder/StageSettings/ValgrindSettings"), {
      loading: () => <StageSettingsLoading />,
    }),
  },
};

export default supportedStages;
