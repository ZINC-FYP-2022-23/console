import { Config, GradingPolicy, Schedule } from "@types";
import * as configUtils from "@utils/Config/config";
import { computed, createStore } from "easy-peasy";
import { GuiBuilderStoreModel } from "../Store";
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

  describe("updateSelectedStageConfig()", () => {
    it("updates the selected stage's config", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        // Mock that we've selected 3rd stage
        selectedStage: computed(() => ({ id: "stage-2", name: "Compile" })),
      };
      const store = createStore(model);
      const newConfig = { input: ["hi.cpp"], output: "hi.out" };
      store.getActions().updateSelectedStageConfig(newConfig);

      expect(store.getState().editingConfig.stageData["stage-2"].config).toEqual(newConfig);
    });

    it("does nothing if there are no selected stages", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        // Mock that there are no selected stages
        selectedStage: computed(() => null),
      };
      const store = createStore(model);
      const newConfig = { hello: "world" };
      jest.spyOn(console, "warn").mockImplementationOnce(() => {});
      store.getActions().updateSelectedStageConfig(newConfig);

      expect(store.getState().editingConfig.stageData).toStrictEqual(model.editingConfig.stageData);
    });
  });
});
