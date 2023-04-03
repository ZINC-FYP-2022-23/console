import { defaultConfig, defaultPolicy, defaultSchedule } from "@/constants/GuiBuilder/defaults";
import {
  Config,
  ConfigDiagnostics,
  DiagnosticRaw,
  GradingPolicy,
  Schedule,
  Settings,
  Stage,
  StageDataMap,
  StageDependencyGraph,
} from "@/types/GuiBuilder";
import { AssignmentConfig } from "@/types/tables";
import { generateStageLabels, isConfigEqual, isLinkedList, isScheduleEqual, parseConfigYaml } from "@/utils/GuiBuilder";
import { configDiagnosticsFromRaw } from "@/utils/GuiBuilder/diagnostics";
import { Action, Computed, Thunk, action, computed, thunk } from "easy-peasy";
import { YAMLException } from "js-yaml";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { MutableKeys } from "utility-types";
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
  /**
   * Whether the store is initialized from the data loaded from database, i.e. whether
   * {@link ConfigModel.initializeAssignment} is called.
   */
  initialized: boolean;

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

  /** Diagnostics found in the {@link Config} after validation by the Grader. */
  diagnostics: ConfigDiagnostics;
}

interface ConfigModelComputed {
  /** Whether the pipeline has a stage given its name. */
  hasStage: Computed<ConfigModel, (stageName: string) => boolean>;
  /** Whether the assignment config has been edited. */
  isEdited: Computed<
    ConfigModel,
    {
      /** Whether any of the pipeline config, policy, or schedule is edited. */
      any: boolean;
      /** Whether the {@link Config pipeline config} is edited. */
      config: boolean;
      /** Whether the {@link GradingPolicy grading policy} is edited. */
      policy: boolean;
      /** Whether the {@link Schedule schedule} is edited. */
      schedule: boolean;
    }
  >;
  /**
   * Whether the grading pipeline's layout is valid.
   *
   * The pipeline is considered valid if the pipeline has no stages, or the stage nodes are connected in
   * a linked list manner.
   */
  isPipelineLayoutValid: Computed<ConfigModel, boolean>;
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
  /**
   * @throws A {@link YAMLException} if there is error while parsing the config YAML.
   */
  initializeConfig: Action<ConfigModel, { id: number | null; configYaml: string }>;
  initializePolicy: Action<ConfigModel, GradingPolicy>;
  initializeSchedule: Action<ConfigModel, Schedule>;

  // NOTE: The following mutators should only mutate the `editing*` states (e.g. `editingConfig`),
  // but not the `init*` states (e.g. `initConfig`).

  setConfigId: Action<ConfigModel, number>;
  setCourseId: Action<ConfigModel, number>;
  setInitialized: Action<ConfigModel, boolean>;
  setPolicy: Action<ConfigModel, GradingPolicy>;
  setSchedule: Action<ConfigModel, Schedule>;
  /** Sets the entire stage data map. */
  setStageData: Action<ConfigModel, StageDataMap>;
  /** Sets the entire stage dependency graph. */
  setStageDeps: Action<ConfigModel, StageDependencyGraph>;
  /**
   * Sets the dependency data of a single stage given its UUID.
   *
   * It creates a new entry in the {@link StageDependencyGraph} if the UUID does not exist.
   */
  setSingleStageDeps: Action<ConfigModel, { stageId: string; deps: string[] }>;
  /**
   * Set a single stage's entire stage data in {@link StageDataMap}.
   *
   * If the `stage` in the payload is `null`, it will delete the `stageId` key from the map.
   */
  setSingleStageData: Action<ConfigModel, { stageId: string; stage: Stage | null }>;
  /**
   * Sets all `init*` fields (e.g. `initConfig`) to the deep copy of the corresponding `editing*`
   * fields (e.g. `editingConfig`).
   *
   * Example usage: Resets the editing progress after a user has saved the config.
   */
  setInitConfigsToEditing: Action<ConfigModel>;

  /**
   * Updates the {@link ConfigModel.diagnostics} state. To specify how the field shall be updated,
   * directly mutate the `diagnostics` parameter in the callback function of the payload.
   */
  updateDiagnostics: Action<ConfigModel, (diagnostics: ConfigDiagnostics) => void>;
  /**
   * Updates the `_settings` field in {@link ConfigModel.editingConfig}.
   *
   * To specify how the field shall be updated, directly mutate the `_settings` parameter in the
   * callback function of the payload.
   */
  updateSettings: Action<ConfigModel, (_settings: Settings) => void>;
  /** Updates a field from the stage data of a single stage given its UUID. */
  updateSingleStageData: Action<
    ConfigModel,
    {
      stageId: string;
      /** Path to update the selected stage data. */
      path: MutableKeys<Stage>;
      value: any;
    }
  >;

  /**
   * Parses the diagnostics from the Grader after validating the config. It will overwrite the previous
   * {@link ConfigModel.diagnostics} state.
   */
  parseDiagnostics: Action<ConfigModel, DiagnosticRaw[]>;
}

interface ConfigModelThunk {
  /**
   * If the store is not {@link ConfigModel.initialized initialized}, it initializes the store states
   * according to the data queried from the database.
   *
   * @throws A {@link YAMLException} if there is error while parsing the config YAML.
   */
  initializeAssignment: Thunk<
    ConfigModel,
    {
      configId: number | null;
      courseId: number | null;
      /** Existing assignment config queried from database (if any). */
      config: AssignmentConfig | null;
    },
    undefined,
    GuiBuilderModel
  >;
  /**
   * Generates a random label if multiple stages of the same name have empty labels.
   * @returns The updated pipeline config.
   */
  generateStageLabels: Thunk<ConfigModel, undefined, undefined, GuiBuilderModel, Config>;
  /** Lazily gets {@link ConfigModel.editingConfig}. */
  getEditingConfig: Thunk<ConfigModel, undefined, undefined, GuiBuilderModel, Config>;
  /** Lazily gets {@link ConfigModel.editingPolicy} and {@link ConfigModel.editingSchedule}. */
  getPolicyAndSchedule: Thunk<ConfigModel, undefined, undefined, GuiBuilderModel, GradingPolicy & Schedule>;
  /** Updates a non-readonly field of the selected stage. */
  updateSelectedStage: Thunk<
    ConfigModel,
    {
      /** Path to update the selected stage data. */
      path: MutableKeys<Stage>;
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
  initialized: false,

  initConfig: defaultConfig,
  editingConfig: defaultConfig,
  initPolicy: defaultPolicy,
  editingPolicy: defaultPolicy,
  initSchedule: defaultSchedule,
  editingSchedule: defaultSchedule,

  diagnostics: {
    _settings: [],
    stages: {},
    others: [],
  },
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
    return {
      any: isConfigEdited || isPolicyEdited || isScheduleEdited,
      config: isConfigEdited,
      policy: isPolicyEdited,
      schedule: isScheduleEdited,
    };
  }),
  isPipelineLayoutValid: computed((state) => {
    return Object.keys(state.editingConfig.stageDeps).length === 0 || isLinkedList(state.editingConfig.stageDeps);
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

  setConfigId: action((state, configId) => {
    state.configId = configId;
  }),
  setCourseId: action((state, courseId) => {
    state.courseId = courseId;
  }),
  setInitialized: action((state, initialized) => {
    state.initialized = initialized;
  }),
  setPolicy: action((state, gradingPolicy) => {
    state.editingPolicy = gradingPolicy;
  }),
  setSchedule: action((state, schedule) => {
    state.editingSchedule = schedule;
  }),
  setStageData: action((state, stageData) => {
    state.editingConfig.stageData = stageData;
  }),
  setStageDeps: action((state, stageDeps) => {
    state.editingConfig.stageDeps = stageDeps;
  }),
  setSingleStageDeps: action((state, { stageId, deps }) => {
    state.editingConfig.stageDeps[stageId] = deps;
  }),
  setSingleStageData: action((state, { stageId, stage }) => {
    if (stage === null) {
      delete state.editingConfig.stageData[stageId];
    } else {
      state.editingConfig.stageData[stageId] = stage;
    }
  }),
  setInitConfigsToEditing: action((state) => {
    state.initConfig = cloneDeep(state.editingConfig);
    state.initPolicy = cloneDeep(state.editingPolicy);
    state.initSchedule = cloneDeep(state.editingSchedule);
  }),

  updateDiagnostics: action((state, callback) => {
    callback(state.diagnostics);
  }),
  updateSettings: action((state, callback) => {
    callback(state.editingConfig._settings);
  }),
  updateSingleStageData: action((state, { stageId, path, value }) => {
    const stage: Stage | undefined = state.editingConfig.stageData[stageId];
    if (stage === undefined) {
      console.warn(`No stage with UUID "${stageId}" found.`);
      return;
    }
    stage[path] = value;
  }),

  parseDiagnostics: action((state, diagnosticsRaw) => {
    state.diagnostics = configDiagnosticsFromRaw(diagnosticsRaw, state.editingConfig.stageData);
  }),
};

const configModelThunk: ConfigModelThunk = {
  initializeAssignment: thunk((actions, { configId, courseId, config }, { getState, getStoreActions }) => {
    if (getState().initialized) return;

    if (courseId !== null) actions.setCourseId(courseId);
    if (config) {
      actions.initializeConfig({ id: configId, configYaml: config.config_yaml });
      actions.initializePolicy({
        attemptLimits: config.attemptLimits,
        gradeImmediately: config.gradeImmediately,
        showImmediateScores: config.showImmediateScores,
      });
      actions.initializeSchedule({
        showAt: config.showAt,
        startCollectionAt: config.startCollectionAt,
        dueAt: config.dueAt,
        stopCollectionAt: config.stopCollectionAt,
        releaseGradeAt: config.releaseGradeAt,
      });
      getStoreActions().pipelineEditor.initializePipeline();
    }

    actions.setInitialized(true);
  }),
  generateStageLabels: thunk((_actions, _payload, { getState, getStoreActions }) => {
    const editingConfig = getState().editingConfig;
    const stageDataNew = generateStageLabels(editingConfig.stageData);
    getStoreActions().config.setStageData(stageDataNew);
    return {
      ...editingConfig,
      stageData: stageDataNew,
    };
  }),
  getEditingConfig: thunk((_actions, _payload, { getState }) => {
    return getState().editingConfig;
  }),
  getPolicyAndSchedule: thunk((_actions, _payload, { getState }) => {
    const { editingPolicy, editingSchedule } = getState();
    return {
      ...editingPolicy,
      ...editingSchedule,
    };
  }),
  updateSelectedStage: thunk((actions, { path, value }, { getStoreState }) => {
    const selectedNode = getStoreState().pipelineEditor.nodes.find((node) => node.selected);
    if (selectedNode === undefined) {
      console.warn("No stage is selected while trying to update the selected stage's config.");
      return;
    }
    actions.updateSingleStageData({ stageId: selectedNode.id, path, value });
  }),
};

export const configModel: ConfigModel = {
  ...configModelState,
  ...configModelComputed,
  ...configModelAction,
  ...configModelThunk,
};

// #endregion
