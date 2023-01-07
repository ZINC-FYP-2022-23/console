import { Config, GradingPolicy, Schedule, StageKind } from "@types";
import * as configUtils from "@utils/Config/config";
import { computed, createStore } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";
import { GuiBuilderStoreModel, initialModel } from "../Store";
import { getThreeStageModel } from "./utils/storeTestUtils";

describe("GuiBuilder Store - BaseActions", () => {
  describe("initializeConfig()", () => {
    it("initializes the store with the config YAML", () => {
      const configYaml = "";
      const mockConfig = {} as Config;
      const parseConfigYamlMock = jest.spyOn(configUtils, "parseConfigYaml").mockReturnValueOnce(mockConfig);

      const store = createStore(getThreeStageModel());
      store.getActions().initializeConfig({ id: 1, configYaml });
      expect(parseConfigYamlMock).toHaveBeenCalledWith(configYaml);

      expect(store.getState().initConfig).toEqual(mockConfig);
      expect(store.getState().editingConfig).toEqual(mockConfig);
      expect(store.getState().configId).toEqual(1);

      // initConfig and editingConfig should not point to the same object
      expect(store.getState().initConfig).not.toBe(store.getState().editingConfig);
    });
  });

  describe("initializePolicy()", () => {
    it("initializes the initPolicy and editingPolicy separately", () => {
      const mockPolicy: GradingPolicy = {
        attemptLimits: 123,
        gradeImmediately: true,
        showImmediateScores: true,
      };
      const store = createStore(getThreeStageModel());
      store.getActions().initializePolicy(mockPolicy);

      expect(store.getState().initPolicy).toEqual(mockPolicy);
      expect(store.getState().editingPolicy).toEqual(mockPolicy);
      expect(store.getState().initPolicy).not.toBe(store.getState().editingPolicy);
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
      const store = createStore(getThreeStageModel());
      store.getActions().initializeSchedule(mockSchedule);

      expect(store.getState().initSchedule).toEqual(mockSchedule);
      expect(store.getState().editingSchedule).toEqual(mockSchedule);
      expect(store.getState().initSchedule).not.toBe(store.getState().editingSchedule);
    });
  });

  describe("updateSelectedStage()", () => {
    it("updates the config of the selected stage", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        // Mock that we've selected 3rd stage
        selectedStage: computed(() => ({ id: "stage-2", name: "Compile", nameInUI: "Compile", label: "" })),
      };
      const store = createStore(model);
      const newConfig = { input: ["hi.cpp"], output: "hi.out" };
      store.getActions().updateSelectedStage({ path: "config", value: newConfig });

      expect(store.getState().editingConfig.stageData["stage-2"].config).toEqual(newConfig);
    });

    it("updates the label of the selected stage", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        // Mock that we've selected 3rd stage
        selectedStage: computed(() => ({ id: "stage-2", name: "Compile", nameInUI: "Compile", label: "" })),
      };
      const store = createStore(model);
      const newLabel = "all";
      store.getActions().updateSelectedStage({ path: "label", value: newLabel });

      expect(store.getState().editingConfig.stageData["stage-2"].label).toEqual(newLabel);
    });

    it("does nothing if there are no selected stages", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        selectedStage: computed(() => null), // Mock that there are no selected stages
      };
      const store = createStore(model);
      const newConfig = { hello: "world" };
      jest.spyOn(console, "warn").mockImplementationOnce(() => {});
      store.getActions().updateSelectedStage({ path: "config", value: newConfig });

      expect(store.getState().editingConfig.stageData).toStrictEqual(model.editingConfig.stageData);
    });
  });

  describe("hasDuplicateNonEmptyLabels", () => {
    it("returns false if there are no duplicate non-empty labels", () => {
      const model = cloneDeep(initialModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-1": {
          name: "FileStructureValidation",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-2": {
          name: "Compile",
          label: "test",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-3": {
          name: "Score",
          label: "test", // OK to have same label as stage-2 because their stage names are different
          kind: StageKind.GRADING,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().hasDuplicateNonEmptyLabels).toBe(false);
    });

    it("returns true if two stages of the same name have the same non-empty label", () => {
      const model = cloneDeep(initialModel);
      model.editingConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "test",
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
        "stage-1": {
          name: "Compile",
          label: "",
          kind: StageKind.PRE_LOCAL,
          config: {},
        },
        "stage-2": {
          name: "DiffWithSkeleton",
          label: "test", // duplicate label with stage-0, which has same stage name
          kind: StageKind.PRE_GLOBAL,
          config: {},
        },
      };
      const store = createStore(model);
      expect(store.getState().hasDuplicateNonEmptyLabels).toBe(true);
    });
  });

  describe("hasStage", () => {
    it("returns true if the pipeline has a stage with the given name", () => {
      const model = cloneDeep(initialModel);
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
      const model = cloneDeep(initialModel);
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
});
