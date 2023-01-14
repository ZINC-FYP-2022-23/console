import { defaultConfig, defaultPolicy, defaultSchedule } from "@constants/GuiBuilder/defaults";
import { Config, GradingPolicy, Schedule, Stage, StageDependencyMap } from "@types";
import { isConfigEqual, isScheduleEqual, parseConfigYaml } from "@utils/GuiBuilder";
import { action, Action, computed, Computed, thunk, Thunk } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import set from "lodash/set";
import { GuiBuilderModel } from "../guiBuilderModel";

// #region Model Definition

/**
 * Model for assignment config data (e.g. pipeline config, grading policy, etc.) that will be saved
 * to the database.
 */
export type ConfigModel = ConfigModelState & ConfigModelComputed & ConfigModelAction & ConfigModelThunk;

interface ConfigModelState {
  /** The assignment config ID. It's `null` if we're creating a new assignment. */
  configId: number | null;
  /** The ID of the course that this config belongs to. */
  courseId: number;

  /** Initial pipeline configuration (e.g. when loaded from database). It should be immutable after initialization. */
  initConfig: Config;
  /** The pipeline config with proposed changes. */
  editingConfig: Config;
  /** Initial grading policy of the assignment. It should be immutable after initialization. */
  initPolicy: GradingPolicy;
  /** The grading policy with proposed changes */
  editingPolicy: GradingPolicy;
  /** Initial scheduling of the assignment. It should be immutable after initialization. */
  initSchedule: Schedule;
  /** The scheduling with proposed changes. */
  editingSchedule: Schedule;
}

interface ConfigModelComputed {
  /** Whether the pipeline has a stage given its name. */
  hasStage: Computed<ConfigModel, (stageName: string) => boolean>;
  /** Whether the config has been edited. */
  isEdited: Computed<ConfigModel, boolean>;
  /**
   * Returns a callback that check whether another stage with the same `stageName` (e.g. `"DiffWithSkeleton"`)
   * has a non-empty {@link Stage.label label} that is equal to the provided `label`.
   *
   * It always return `false` if the provided `label` is empty, since the UI allows two stages of the same
   * name to both have empty labels.
   */
  isStageLabelDuplicate: Computed<ConfigModel, (stageName: string, label: string) => boolean>;
}

interface ConfigModelAction {
  setCourseId: Action<ConfigModel, number>;
  initializeConfig: Action<ConfigModel, { id: number | null; configYaml: string }>;
  initializePolicy: Action<ConfigModel, GradingPolicy>;
  initializeSchedule: Action<ConfigModel, Schedule>;

  // TODO(Anson): Rename the following actions with better names (e.g. `updateField`, `setStageData`, etc.)

  /** Updates a field in `editingConfig` given its `path`. */
  updateField: Action<ConfigModel, { path: string; value: any }>;
  /**
   * Set an entire's stage data in the stage data map inside {@link ConfigModel.editingConfig}.
   *
   * If the `stage` in the payload is `null`, it will delete the `stageId` key from the map.
   */
  setStageData: Action<ConfigModel, { stageId: string; stage: Stage | null }>;
  /** Updates the data of a single stage given its UUID. */
  updateStageData: Action<
    ConfigModel,
    {
      stageId: string;
      /** Path to update the selected stage data. It's same as `keyof Stage` but without `readonly` keys. */
      // TODO(Anson): Install `utility-types` package and replace with `MutableKeys<Stage>`
      path: "label" | "config";
      value: any;
    }
  >;
  /** Sets the entire stage dependency map. */
  setStageDeps: Action<ConfigModel, StageDependencyMap>;
  /**
   * Updates the dependency data of a single stage given its UUID.
   *
   * It creates a new entry in the dependency map if the UUID does not exist.
   */
  updateStageDeps: Action<ConfigModel, { stageId: string; deps: string[] }>;
  updatePolicy: Action<ConfigModel, GradingPolicy>;
  updateSchedule: Action<ConfigModel, Schedule>;
}

interface ConfigModelThunk {
  /** Updates a non-readonly field of the selected stage. */
  updateSelectedStage: Thunk<
    ConfigModel,
    {
      /** Path to update the selected stage data. It's same as `keyof Stage` but without `readonly` keys. */
      // TODO(Anson): Install `utility-types` package and replace with `MutableKeys<Stage>`
      path: "label" | "config";
      value: any;
    },
    undefined,
    GuiBuilderModel
  >;
}

// #endregion

// #region Model Implementation

const configModelState: ConfigModelState = {
  configId: null,
  courseId: 0,
  initConfig: defaultConfig,
  editingConfig: defaultConfig,
  initPolicy: defaultPolicy,
  editingPolicy: defaultPolicy,
  initSchedule: defaultSchedule,
  editingSchedule: defaultSchedule,
};

const configModelComputed: ConfigModelComputed = {
  hasStage: computed((state) => {
    return (stageName: string) =>
      Object.values(state.editingConfig.stageData).some((stage) => stage.name === stageName);
  }),
  isEdited: computed((state) => {
    const isConfigEdited = !isConfigEqual(state.initConfig, state.editingConfig);
    const isPolicyEdited = !isEqual(state.initPolicy, state.editingPolicy);
    const isScheduleEdited = !isScheduleEqual(state.initSchedule, state.editingSchedule);
    return isConfigEdited || isPolicyEdited || isScheduleEdited;
  }),
  isStageLabelDuplicate: computed((state) => {
    return (stageName: string, label: string) => {
      if (label === "") return false;

      let hasProcessedItself = false;
      for (const stage of Object.values(state.editingConfig.stageData)) {
        if (stage.name === stageName && stage.label === label) {
          if (hasProcessedItself) return true;
          hasProcessedItself = true;
        }
      }
      return false;
    };
  }),
};

const configModelAction: ConfigModelAction = {
  setCourseId: action((state, courseId) => {
    state.courseId = courseId;
  }),
  initializeConfig: action((state, payload) => {
    const { id, configYaml } = payload;
    const config = parseConfigYaml(configYaml);
    state.initConfig = config;
    state.editingConfig = cloneDeep(config);
    state.configId = id;
  }),
  initializePolicy: action((state, gradingPolicy) => {
    state.initPolicy = gradingPolicy;
    state.editingPolicy = { ...gradingPolicy };
  }),
  initializeSchedule: action((state, schedule) => {
    state.initSchedule = schedule;
    state.editingSchedule = { ...schedule };
  }),

  updateField: action((state, payload) => {
    set(state.editingConfig, payload.path, payload.value);
  }),
  setStageData: action((state, { stageId, stage }) => {
    if (stage === null) {
      delete state.editingConfig.stageData[stageId];
    } else {
      state.editingConfig.stageData[stageId] = stage;
    }
  }),
  updateStageData: action((state, { stageId, path, value }) => {
    const stage: Stage | undefined = state.editingConfig.stageData[stageId];
    if (stage === undefined) {
      console.warn(`No stage with UUID "${stageId}" found.`);
      return;
    }
    stage[path] = value;
  }),
  setStageDeps: action((state, stageDeps) => {
    state.editingConfig.stageDeps = stageDeps;
  }),
  updateStageDeps: action((state, { stageId, deps }) => {
    state.editingConfig.stageDeps[stageId] = deps;
  }),
  updatePolicy: action((state, gradingPolicy) => {
    state.editingPolicy = gradingPolicy;
  }),
  updateSchedule: action((state, schedule) => {
    state.editingSchedule = schedule;
  }),
};

const configModelThunk: ConfigModelThunk = {
  updateSelectedStage: thunk((actions, { path, value }, { getStoreState }) => {
    const selectedNode = getStoreState().pipelineEditor.nodes.find((node) => node.selected);
    if (selectedNode === undefined) {
      console.warn("No stage is selected while trying to update the selected stage's config.");
      return;
    }
    actions.updateStageData({ stageId: selectedNode.id, path, value });
  }),
};

export const configModel: ConfigModel = {
  ...configModelState,
  ...configModelComputed,
  ...configModelAction,
  ...configModelThunk,
};

// #endregion
