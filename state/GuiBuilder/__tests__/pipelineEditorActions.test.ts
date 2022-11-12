/// <reference types="jest-extended" />
import { defaultSettings } from "@constants/Config/defaults";
import { StageDataMap, StageKind, StageNode } from "@types";
import { computed, createStore, thunkOn } from "easy-peasy";
import "jest-extended";
import cloneDeep from "lodash/cloneDeep";
import * as uuid from "uuid";
import { GuiBuilderStoreModel, initialModel } from "../Store";
import { getThreeStageModel } from "./utils/storeTestUtils";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue("stage-3");

describe("GuiBuilder Store - PipelineEditorActions", () => {
  describe("initializePipeline()", () => {
    it("initializes nodes and edges in the pipeline editor", () => {
      const model: GuiBuilderStoreModel = {
        ...cloneDeep(initialModel),
        initConfig: {
          _settings: defaultSettings,
          stageDeps: {
            "stage-0": [],
            "stage-1": ["stage-0"],
          },
          stageData: {
            "stage-0": {
              key: "diffWithSkeleton",
              name: "DiffWithSkeleton",
              kind: StageKind.PRE_GLOBAL,
              config: {
                exclude_from_provided: true,
              },
            },
            "stage-1": {
              key: "compile:all",
              name: "Compile",
              kind: StageKind.PRE_LOCAL,
              config: {
                input: ["*.cpp"],
                output: "a.out",
              },
            },
          },
        },
        // Since `initializePipeline()` will trigger thunkOn, we mock it
        triggerLayoutPipeline: thunkOn(
          () => [],
          () => {},
        ),
      };
      const store = createStore(model, {});
      store.getActions().initializePipeline();

      expect(store.getState().pipelineEditor.nodes).toEqual([
        {
          id: "stage-0",
          position: { x: 0, y: 0 },
          data: { name: "DiffWithSkeleton", label: "Diff With Skeleton" },
          type: "stage",
        },
        {
          id: "stage-1",
          position: { x: 0, y: 0 },
          data: { name: "Compile", label: "Compile" },
          type: "stage",
        },
      ]);
      expect(store.getState().pipelineEditor.edges).toEqual([
        { id: "reactflow__edge-stage-0-stage-1", source: "stage-0", target: "stage-1", type: "stage" },
      ]);
    });
  });

  describe("addStageNode()", () => {
    const expectedPipelineEditorNodes: StageNode[] = [
      ...getThreeStageModel().pipelineEditor.nodes,
      {
        id: "stage-3",
        position: { x: 0, y: 0 },
        data: { name: "Score", label: "Score" },
        type: "stage",
      },
    ];
    const expectedStageData: StageDataMap = {
      ...getThreeStageModel().editingConfig.stageData,
      "stage-3": {
        key: "score",
        name: "Score",
        kind: StageKind.POST,
        config: {},
      },
    };

    it("adds a stage that's disconnected from the pipeline", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 1 -> 2  3`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().addStageNode({ position: { x: 0, y: 0 } });

      expect(store.getState().pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(store.getState().pipelineEditor.edges).toEqual(model.pipelineEditor.edges);
      expect(store.getState().editingConfig.stageDeps).toEqual({ ...model.editingConfig.stageDeps, "stage-3": [] });
      expect(store.getState().editingConfig.stageData).toEqual(expectedStageData);
    });

    it("adds a stage where its parent is the first stage", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 3 -> 1 -> 2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().addStageNode({
        position: { x: 0, y: 0 },
        parent: "stage-0",
      });

      expect(store.getState().pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(store.getState().pipelineEditor.edges).toIncludeAllMembers([
        { id: "reactflow__edge-stage-0-stage-3", source: "stage-0", target: "stage-3", type: "stage" },
        { id: "reactflow__edge-stage-3-stage-1", source: "stage-3", target: "stage-1", type: "stage" },
        { id: "reactflow__edge-stage-1-stage-2", source: "stage-1", target: "stage-2", type: "stage" },
      ]);
      expect(store.getState().editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": ["stage-3"],
        "stage-2": ["stage-1"],
        "stage-3": ["stage-0"],
      });
      expect(store.getState().editingConfig.stageData).toEqual(expectedStageData);
    });

    it("adds a stage where its parent is the last stage", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 1 -> 2 -> 3`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().addStageNode({
        position: { x: 0, y: 0 },
        parent: "stage-2",
      });

      expect(store.getState().pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(store.getState().pipelineEditor.edges).toIncludeAllMembers([
        ...model.pipelineEditor.edges,
        { id: "reactflow__edge-stage-2-stage-3", source: "stage-2", target: "stage-3", type: "stage" },
      ]);
      expect(store.getState().editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": ["stage-0"],
        "stage-2": ["stage-1"],
        "stage-3": ["stage-2"],
      });
      expect(store.getState().editingConfig.stageData).toEqual(expectedStageData);
    });
  });

  describe("deleteStageNode()", () => {
    it("deletes a stage in middle of the pipeline", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0    2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().deleteStageNode("stage-1");

      expect(store.getState().pipelineEditor.nodes).toIncludeAllMembers([
        model.pipelineEditor.nodes[0],
        model.pipelineEditor.nodes[2],
      ]);
      expect(store.getState().pipelineEditor.edges).toEqual([]);

      const { "stage-1": deleted, ...expectedStageData } = model.editingConfig.stageData;
      expect(store.getState().editingConfig.stageData).toEqual(expectedStageData);
      expect(store.getState().editingConfig.stageDeps).toEqual({ "stage-0": [], "stage-2": [] });
    });
  });

  describe("deleteStageEdge()", () => {
    it("deletes a stage edge", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0   1 -> 2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().deleteStageEdge("reactflow__edge-stage-0-stage-1");

      expect(store.getState().pipelineEditor.nodes).toEqual(model.pipelineEditor.nodes);
      expect(store.getState().pipelineEditor.edges).toEqual([
        { id: "reactflow__edge-stage-1-stage-2", source: "stage-1", target: "stage-2", type: "stage" },
      ]);
      expect(store.getState().editingConfig.stageData).toEqual(model.editingConfig.stageData);
      expect(store.getState().editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": [],
        "stage-2": ["stage-1"],
      });
    });
  });

  describe("duplicateStage()", () => {
    it("duplicates the selected stage", () => {
      const model: GuiBuilderStoreModel = {
        ...getThreeStageModel(),
        // Mock that we're duplicating 3rd stage
        selectedStage: computed(() => ({ id: "stage-2", name: "Compile" })),
      };
      const store = createStore(model);
      store.getActions().duplicateStage();

      expect(store.getState().pipelineEditor.edges).toEqual(model.pipelineEditor.edges);
      expect(store.getState().pipelineEditor.nodes.length).toBe(4);
      const newNode = store.getState().pipelineEditor.nodes[3];
      expect(newNode.id).toBe("stage-3");
      expect(newNode.data.name).toBe("Compile");

      expect(store.getState().editingConfig.stageDeps).toEqual({
        ...model.editingConfig.stageDeps,
        "stage-3": [],
      });
      expect(store.getState().editingConfig.stageData).toEqual({
        ...model.editingConfig.stageData,
        "stage-3": model.editingConfig.stageData["stage-2"],
      });
    });
  });
});
