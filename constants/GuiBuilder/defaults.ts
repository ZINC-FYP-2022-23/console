import {
  Config,
  GradeAppealPolicy,
  GradingPolicy,
  JoinPolicy,
  Predicate,
  PredicateSupportedValueTypes,
  Schedule,
  ScoreWeighting,
  Settings,
  TestCase,
  Valgrind,
  XUnitOverride,
} from "@/types/GuiBuilder";
import { addDays, set } from "date-fns";
import { Required } from "utility-types";
import { v4 as uuidv4 } from "uuid";

/**
 * Default values for the `_settings` field in an assignment config.
 *
 * Most default values are based from {@link https://docs.zinc.ust.dev/user/model/Config.html#settings the Grader documentation}
 */
export const defaultSettings: Settings = {
  lang: {
    language: "cpp",
    compiler: "g++",
    version: "",
  },
  use_template: undefined,
  template: [{ id: uuidv4(), name: "" }],
  use_skeleton: false,
  use_provided: true,
  stage_wait_duration_secs: 60,
  cpus: 2.0,
  mem_gb: 4.0,
  early_return_on_throw: false,
  enable_features: {
    network: true,
    gpu_device: undefined,
  },
};

/**
 * Default values for an empty assignment config.
 */
export const defaultConfig: Config = {
  _settings: defaultSettings,
  stageDeps: {},
  stageData: {},
};

export const defaultGradeAppeal: GradeAppealPolicy = {
  isAppealAllowed: false,
  appealLimits: null,
  appealStartAt: null,
  appealStopAt: null,
  isAppealStudentReplyAllowed: true,
  isAppealViewReportAllowed: true,
};

export const defaultJoinPolicy: JoinPolicy = "AND";

export const defaultPolicy: GradingPolicy = {
  attemptLimits: null,
  gradeImmediately: false,
  showImmediateScores: false,
};

export const defaultPredicate: Predicate<Record<PredicateSupportedValueTypes, string | boolean | number>, "EQ"> = {
  op: "EQ", // "EQ" is chosen since it's found in all types of predicate operations
  value: {
    string: "",
    boolean: true,
    number: 0,
  },
};

export const defaultSchedule: Schedule = {
  showAt: null,
  startCollectionAt: new Date().toISOString(),
  dueAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
  stopCollectionAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
  releaseGradeAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
};

export const defaultScoreWeightingXUnit: ScoreWeighting<XUnitOverride> = {
  default: 1,
  overrides: [],
};

export const defaultTestCase: TestCase = {
  id: 0,
  file: "",
  visibility: "ALWAYS_VISIBLE",
  _stdinInputMode: "none",
  _expectedInputMode: "text",
  expected: "",
  _valgrindOverride: false,
};

/**
 * Default total score of a {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#total-based-scorable Total-Based Scorable}
 * stage.
 */
export const defaultTotalScorableScore = 10;

/**
 * Default config values for Valgrind stage.
 * ({@link https://docs.zinc.ust.dev/user/pipeline/docker/Valgrind.html Reference}).
 */
export const defaultValgrindConfig: Valgrind = {
  enabled: true,
  checksFilter: ["*"],
  visibility: "INHERIT",
};

export const defaultXUnitOverride: Required<XUnitOverride, "joinPolicy"> = {
  _uuid: uuidv4(),
  score: 1,
  joinPolicy: defaultJoinPolicy,
  testName: { op: "EQ", value: "" },
};
