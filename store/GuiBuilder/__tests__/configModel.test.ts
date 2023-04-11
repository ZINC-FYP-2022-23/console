import { Config, GradeAppealPolicy, GradingPolicy, Schedule, Stage, StageKind } from "@/types/GuiBuilder";
import { AssignmentConfig } from "@/types/tables";
import * as configUtils from "@/utils/GuiBuilder/config";
import { createStore } from "easy-peasy";
import "jest-extended";
import cloneDeep from "lodash/cloneDeep";
import { guiBuilderModel } from "../guiBuilderModel";
import { configModel } from "../model/configModel";
import { getThreeStageModel } from "./utils/storeTestUtils";

describe("GuiBuilder: Store - ConfigModel", () => {
  describe("duplicatedStageLabel", () => {
    it("returns the stage name and label if there are duplicated non-empty labels", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "main",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-2": {
          name: "Compile",
          label: "main",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().duplicatedStageLabel).toEqual({ name: "Compile", label: "main" });
    });

    it("returns null if there are no duplicated non-empty labels", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "Compile",
          label: "",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().duplicatedStageLabel).toBeNull();

      store.getActions().setStageData({
        "stage-0": {
          name: "Diff With Skeleton",
          label: "test",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "test",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
      });
      // OK to have same label as stage-0 because their stage names are different
      expect(store.getState().duplicatedStageLabel).toBeNull();
    });
  });

  describe("hasStage", () => {
    it("returns true if the pipeline has a stage with the given name", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-1": {
          name: "Valgrind",
          label: "",
          kind: StageKind.GRADING,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().hasStage("Valgrind")).toBe(true);
    });

    it("returns false if the pipeline does not have a stage with the given name", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().hasStage("Valgrind")).toBe(false);
    });
  });

  describe("isStageLabelDuplicate", () => {
    it("returns false if the given stage label is empty", () => {
      const store = createStore(configModel);
      expect(store.getState().isStageLabelDuplicate("Compile", "")).toBe(false);
    });

    it("returns false if the given non-empty stage label is not duplicate", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "Compile",
          label: "main",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "test",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-2": {
          name: "Score",
          label: "main", // OK to have same label as stage-0 because their stage names are different
          kind: StageKind.GRADING,
          config: {},
        },
      };
      const store = createStore(model);
      Object.values(model.editingConfig.stageData).forEach((stage) => {
        expect(store.getState().isStageLabelDuplicate(stage.name, stage.label)).toBe(false);
      });
    });

    it("returns true if the given non-empty label is duplicate", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "Compile",
          label: "main",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "test",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-2": {
          name: "Compile",
          label: "main",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
      };
      const store = createStore(model);

      const state = store.getState();
      expect(state.isStageLabelDuplicate("Compile", "main")).toBe(true);
      // The result of passing "main" as label should not interfere with the result of passing "test" as label
      expect(state.isStageLabelDuplicate("Compile", "test")).toBe(false);
    });
  });

  describe("initializeConfig()", () => {
    it("initializes the store with the config YAML", () => {
      const configYaml = "";
      const mockConfig = {} as Config;
      const parseConfigYamlMock = jest.spyOn(configUtils, "parseConfigYaml").mockReturnValueOnce(mockConfig);

      const store = createStore(configModel);
      store.getActions().initializeConfig({ id: 1, configYaml });
      expect(parseConfigYamlMock).toHaveBeenCalledWith(configYaml);

      const state = store.getState();
      expect(state.initConfig).toStrictEqual(mockConfig);
      expect(state.editingConfig).toStrictEqual(mockConfig);
      expect(state.configId).toBe(1);

      // initConfig and editingConfig should not point to the same object
      expect(state.initConfig).not.toBe(state.editingConfig);
    });
  });

  describe("initializeGradeAppeal()", () => {
    it("initializes the initGradeAppeal and editingGradeAppeal separately", () => {
      const mockGradeAppeal: GradeAppealPolicy = {
        isAppealAllowed: true,
        appealLimits: null,
        appealStartAt: "2021-01-01T00:00:00.000Z",
        appealStopAt: "2021-01-07T00:00:00.000Z",
        isAppealStudentReplyAllowed: true,
        isAppealViewReportAllowed: true,
      };
      const store = createStore(configModel);
      store.getActions().initializeGradeAppeal(mockGradeAppeal);

      const state = store.getState();
      expect(state.initGradeAppeal).toStrictEqual(mockGradeAppeal);
      expect(state.editingGradeAppeal).toStrictEqual(mockGradeAppeal);
      expect(state.initGradeAppeal).not.toBe(state.editingGradeAppeal);
    });
  });

  describe("initializePolicy()", () => {
    it("initializes the initPolicy and editingPolicy separately", () => {
      const mockPolicy: GradingPolicy = {
        attemptLimits: 123,
        gradeImmediately: true,
        showImmediateScores: true,
      };
      const store = createStore(configModel);
      store.getActions().initializePolicy(mockPolicy);

      const state = store.getState();
      expect(state.initPolicy).toStrictEqual(mockPolicy);
      expect(state.editingPolicy).toStrictEqual(mockPolicy);
      expect(state.initPolicy).not.toBe(state.editingPolicy);
    });
  });

  describe("initializeSchedule()", () => {
    it("initializes the initSchedule and editingSchedule separately", () => {
      const mockSchedule: Schedule = {
        showAt: "2021-01-01T00:00:00.000Z",
        startCollectionAt: "2021-01-01T00:00:00.000Z",
        dueAt: "2021-03-01T00:00:00.000Z",
        stopCollectionAt: "2021-03-01T00:00:00.000Z",
        releaseGradeAt: "2021-03-10T00:00:00.000Z",
      };
      const store = createStore(configModel);
      store.getActions().initializeSchedule(mockSchedule);

      const state = store.getState();
      expect(state.initSchedule).toStrictEqual(mockSchedule);
      expect(state.editingSchedule).toStrictEqual(mockSchedule);
      expect(state.initSchedule).not.toBe(state.editingSchedule);
    });
  });

  describe("setSingleStageDeps()", () => {
    it("sets the stage dependencies of an existing stage", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageDeps = {
        "stage-0": [],
        "stage-1": ["stage-0"],
      };
      const store = createStore(model);
      store.getActions().setSingleStageDeps({ stageId: "stage-0", deps: ["stage-2"] });

      const { editingConfig, initConfig } = store.getState();
      expect(editingConfig.stageDeps).toStrictEqual({
        "stage-0": ["stage-2"],
        "stage-1": ["stage-0"],
      });
      expect(initConfig.stageDeps).toStrictEqual(model.initConfig.stageDeps);
    });

    it("creates a new entry if the stage does not exist", () => {
      const model = cloneDeep(configModel);
      model.editingConfig.stageDeps = { "stage-0": [] };
      const store = createStore(model);
      store.getActions().setSingleStageDeps({ stageId: "stage-1", deps: ["stage-0"] });

      const { editingConfig, initConfig } = store.getState();
      expect(editingConfig.stageDeps).toStrictEqual({
        "stage-0": [],
        "stage-1": ["stage-0"],
      });
      expect(initConfig.stageDeps).toStrictEqual(model.initConfig.stageDeps);
    });
  });

  describe("setSingleStageData()", () => {
    it("sets the stage data of an existing stage", () => {
      const model = getThreeStageModel();
      const store = createStore(model);

      const newStage0Data: Stage = {
        name: "Score",
        label: "",
        kind: StageKind.POST,
        config: {},
      };
      store.getActions().config.setSingleStageData({ stageId: "stage-0", stage: newStage0Data });

      const { editingConfig, initConfig } = store.getState().config;
      expect(editingConfig.stageData).toStrictEqual({
        ...model.config.editingConfig.stageData,
        "stage-0": newStage0Data,
      });
      expect(initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });

    it("deletes the stage data if the `stage` payload is `null`", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().config.setSingleStageData({ stageId: "stage-0", stage: null });

      const { editingConfig, initConfig } = store.getState().config;
      const { "stage-0": _, ...expectedStageData } = model.config.editingConfig.stageData;
      expect(editingConfig.stageData).toStrictEqual(expectedStageData);
      expect(initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });
  });

  describe("setInitConfigsToEditing()", () => {
    it("sets `init*` fields to corresponding `editing*` fields", () => {
      const model = getThreeStageModel();
      model.config.editingPolicy = {
        ...model.config.initPolicy,
        attemptLimits: 10,
      };
      model.config.editingSchedule = {
        ...model.config.initSchedule,
        showAt: new Date(2023, 1).toISOString(),
      };
      const store = createStore(model);

      store.getActions().config.setInitConfigsToEditing();

      const { config } = store.getState();
      expect(config.initConfig).toStrictEqual(config.editingConfig);
      expect(config.initPolicy).toStrictEqual(config.initPolicy);
      expect(config.initSchedule).toStrictEqual(config.initSchedule);

      // Test that they don't share the same reference
      expect(config.initConfig).not.toBe(config.editingConfig);
      expect(config.initPolicy).not.toBe(config.editingPolicy);
      expect(config.initSchedule).not.toBe(config.editingSchedule);
    });
  });

  describe("updateSettings()", () => {
    it("updates the `_settings` field in `editingConfig`", () => {
      const model = cloneDeep(configModel);
      const store = createStore(model);
      store.getActions().updateSettings((_settings) => (_settings.lang.version = "10.0.0"));

      const state = store.getState();
      expect(state.editingConfig._settings.lang.version).toBe("10.0.0");
      expect(state.initConfig._settings.lang.version).toBe(model.initConfig._settings.lang.version);
    });
  });

  describe("updateSingleStageData()", () => {
    it("updates a field from the stage data of a single stage", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().config.updateSingleStageData({
        stageId: "stage-0",
        path: "label",
        value: "test",
      });

      const { editingConfig, initConfig } = store.getState().config;
      expect(editingConfig.stageData["stage-0"]).toStrictEqual({
        ...model.config.editingConfig.stageData["stage-0"],
        label: "test",
      });
      expect(initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });

    it("does nothing if the given stage ID is not found", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      jest.spyOn(console, "warn").mockImplementationOnce(() => {});
      store.getActions().config.updateSingleStageData({
        stageId: "stage-999",
        path: "label",
        value: "test",
      });

      const { editingConfig, initConfig } = store.getState().config;
      expect(editingConfig.stageData).toStrictEqual(model.config.editingConfig.stageData);
      expect(initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });
  });

  describe("initializeAssignment()", () => {
    const type = {
      initAssignmentStart: "@thunk.config.initializeAssignment(start)",
      initAssignmentSuccess: "@thunk.config.initializeAssignment(success)",
      setCourseId: "@action.config.setCourseId",
      setInitialized: "@action.config.setInitialized",
      initConfig: "@action.config.initializeConfig",
      initGradeAppeal: "@action.config.initializeGradeAppeal",
      initPolicy: "@action.config.initializePolicy",
      initSchedule: "@action.config.initializeSchedule",
      initPipelineStart: "@thunk.pipelineEditor.initializePipeline(start)",
      initPipelineSuccess: "@thunk.pipelineEditor.initializePipeline(success)",
    };

    it("initializes the store states", () => {
      const model = cloneDeep(guiBuilderModel);
      const store = createStore(model, { mockActions: true });

      const configId = 1;
      const courseId = 2;
      const config = {} as AssignmentConfig;
      const payload = { configId, courseId, config };

      store.getActions().config.initializeAssignment(payload);

      const mockedActions = store.getMockedActions();
      expect(mockedActions[0]).toEqual({ type: type.initAssignmentStart, payload });
      expect(mockedActions.map((action) => action.type)).toIncludeAllMembers([
        type.initAssignmentStart,
        type.setCourseId,
        type.initConfig,
        type.initGradeAppeal,
        type.initPolicy,
        type.initSchedule,
        type.initPipelineStart,
        // ... ignore other actions invoked by `initializePipeline()`
        type.initPipelineSuccess,
        type.setInitialized,
        type.initAssignmentSuccess,
      ]);

      // initializePipeline() should be called after initializeConfig()
      const initConfigIndex = mockedActions.findIndex((action) => action.type === type.initConfig);
      const initPipelineIndex = mockedActions.findIndex((action) => action.type === type.initPipelineStart);
      expect(initPipelineIndex).toBeGreaterThan(initConfigIndex);
    });

    it("only sets the course ID if config is null", () => {
      const model = cloneDeep(guiBuilderModel);
      const store = createStore(model, { mockActions: true });

      const courseId = 1;
      const payload = { configId: null, courseId, config: null };

      store.getActions().config.initializeAssignment(payload);

      expect(store.getMockedActions()).toEqual([
        { type: type.initAssignmentStart, payload },
        { type: type.setCourseId, payload: courseId },
        { type: type.setInitialized, payload: true },
        { type: type.initAssignmentSuccess, payload },
      ]);
    });

    it("only sets `initialized` to true if every payload field is null", () => {
      const model = cloneDeep(guiBuilderModel);
      const store = createStore(model, { mockActions: true });
      const payload = { configId: null, courseId: null, config: null };

      store.getActions().config.initializeAssignment(payload);

      expect(store.getMockedActions()).toEqual([
        { type: type.initAssignmentStart, payload },
        { type: type.setInitialized, payload: true },
        { type: type.initAssignmentSuccess, payload },
      ]);
    });

    it("does nothing if the store is already initialized", () => {
      const model = getThreeStageModel();
      model.config.initialized = true; // Assume it's initialized
      const store = createStore(model, { mockActions: true });
      const payload = { configId: null, courseId: 1, config: null };

      store.getActions().config.initializeAssignment(payload);

      expect(store.getMockedActions()).toEqual([
        { type: type.initAssignmentStart, payload },
        { type: type.initAssignmentSuccess, payload },
      ]);
    });
  });

  describe("updateSelectedStage()", () => {
    it("updates the config of the selected stage", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[2].selected = true; // Mock that we've selected 3rd stage
      const store = createStore(model);
      const newConfig = { input: ["hi.cpp"], output: "hi.out" };
      store.getActions().config.updateSelectedStage({ path: "config", value: newConfig });

      const { config } = store.getState();
      expect(config.editingConfig.stageData["stage-2"].config).toStrictEqual(newConfig);
      expect(config.initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });

    it("updates the label of the selected stage", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[2].selected = true; // Mock that we've selected 3rd stage
      const store = createStore(model);
      const newLabel = "all";
      store.getActions().config.updateSelectedStage({ path: "label", value: newLabel });

      const { config } = store.getState();
      expect(config.editingConfig.stageData["stage-2"].label).toStrictEqual(newLabel);
      expect(config.initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });

    it("does nothing if there are no selected stages", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      const newConfig = { hello: "world" };
      jest.spyOn(console, "warn").mockImplementationOnce(() => {});
      store.getActions().config.updateSelectedStage({ path: "config", value: newConfig });

      const { config } = store.getState();
      expect(config.editingConfig.stageData).toStrictEqual(model.config.editingConfig.stageData);
      expect(config.initConfig.stageData).toStrictEqual(model.config.initConfig.stageData);
    });
  });
});
