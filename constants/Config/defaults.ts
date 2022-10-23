import type { Config, GradingPolicy, Schedule, Settings } from "@types";
import { addDays, set } from "date-fns";

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
  template: undefined,
  use_skeleton: false,
  use_provided: false,
  stage_wait_duration_secs: "60",
  cpus: "2.0",
  mem_gb: "4.0",
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
  stages: [],
};

export const defaultPolicy: GradingPolicy = {
  attemptLimits: null,
  gradeImmediately: false,
  showImmediateScores: false,
};

export const defaultSchedule: Schedule = {
  showAt: "",
  startCollectionAt: new Date().toISOString(),
  dueAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
  stopCollectionAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
  releaseGradeAt: set(addDays(new Date(), 7), { hours: 23, minutes: 59 }).toISOString(),
};
