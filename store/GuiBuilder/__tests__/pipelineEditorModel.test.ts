/// <reference types="jest-extended" />
import supportedStages from "@constants/GuiBuilder/supportedStages";
import { StageDataMap, StageKind, StageNode } from "@types";
import { computed, createStore, thunkOn } from "easy-peasy";
import "jest-extended";
import * as uuid from "uuid";
import { getThreeStageModel } from "./utils/storeTestUtils";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue("stage-3");

describe("GuiBuilder Store - PipelineEditorModel", () => {
  describe("selectedStage", () => {
    it("returns the data of the selected stage", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[0].selected = true;
      model.config.editingConfig.stageData["stage-0"].label = "foo";

      const store = createStore(model);
      expect(store.getState().pipelineEditor.selectedStage).toEqual({
        id: "stage-0",
        name: "DiffWithSkeleton",
        nameInUI: "Diff With Skeleton",
        label: "foo",
      });
    });

    it("returns null if no stages are selected", () => {
      const store = createStore(getThreeStageModel());
      expect(store.getState().pipelineEditor.selectedStage).toBeNull();
    });
  });

  describe("initializePipeline()", () => {
    it("initializes nodes and edges in the pipeline editor", () => {
      const model = getThreeStageModel();
      model.config.initConfig.stageDeps = {
        "stage-0": [],
        "stage-1": ["stage-0"],
      };
      model.config.initConfig.stageData = {
        "stage-0": {
          name: "DiffWithSkeleton",
          label: "",
          kind: StageKind.PRE_GLOBAL,
          config: {
            exclude_from_provided: true,
          },
        },
        "stage-1": {
          name: "Compile",
          label: "all",
          kind: StageKind.PRE_LOCAL,
          config: {
            input: ["*.cpp"],
            output: "a.out",
          },
        },
      };
      // Mock the thunkOn which is triggered by `initializePipeline()`
      model.pipelineEditor.triggerLayoutPipeline = thunkOn(
        () => [],
        () => {},
      );

      const store = createStore(model);
      store.getActions().pipelineEditor.initializePipeline();

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toEqual([
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
      expect(state.pipelineEditor.edges).toEqual([
        { id: "reactflow__edge-stage-0-stage-1", source: "stage-0", target: "stage-1", type: "stage" },
      ]);
    });
  });

  describe("addStageNode()", () => {
    const expectedPipelineEditorNodes: StageNode[] = [
      ...getThreeStageModel().pipelineEditor.nodes,
      // Since getThreeStageModel() is dragging a new "Score" stage, we expect this stage to
      // be found after calling `addStageNode()`
      {
        id: "stage-3",
        position: { x: 0, y: 0 },
        data: { name: "Score", label: "Score" },
        type: "stage",
      },
    ];
    const expectedStageData: StageDataMap = {
      ...getThreeStageModel().config.editingConfig.stageData,
      "stage-3": {
        name: "Score",
        label: "",
        kind: StageKind.POST,
        config: supportedStages.Score.defaultConfig,
      },
    };

    it("adds a stage that's disconnected from the pipeline", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 1 -> 2  3`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.addStageNode({ position: { x: 0, y: 0 } });

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(state.pipelineEditor.edges).toEqual(model.pipelineEditor.edges);
      expect(state.config.editingConfig.stageDeps).toEqual({
        ...model.config.editingConfig.stageDeps,
        "stage-3": [],
      });
      expect(state.config.editingConfig.stageData).toEqual(expectedStageData);
    });

    it("adds a stage where its parent is the first stage", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 3 -> 1 -> 2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.addStageNode({
        position: { x: 0, y: 0 },
        parent: "stage-0",
      });

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(state.pipelineEditor.edges).toIncludeAllMembers([
        { id: "reactflow__edge-stage-0-stage-3", source: "stage-0", target: "stage-3", type: "stage" },
        { id: "reactflow__edge-stage-3-stage-1", source: "stage-3", target: "stage-1", type: "stage" },
        { id: "reactflow__edge-stage-1-stage-2", source: "stage-1", target: "stage-2", type: "stage" },
      ]);
      expect(state.config.editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": ["stage-3"],
        "stage-2": ["stage-1"],
        "stage-3": ["stage-0"],
      });
      expect(state.config.editingConfig.stageData).toEqual(expectedStageData);
    });

    it("adds a stage where its parent is the last stage", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0 -> 1 -> 2 -> 3`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.addStageNode({
        position: { x: 0, y: 0 },
        parent: "stage-2",
      });

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toEqual(expectedPipelineEditorNodes);
      expect(state.pipelineEditor.edges).toIncludeAllMembers([
        ...model.pipelineEditor.edges,
        { id: "reactflow__edge-stage-2-stage-3", source: "stage-2", target: "stage-3", type: "stage" },
      ]);
      expect(state.config.editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": ["stage-0"],
        "stage-2": ["stage-1"],
        "stage-3": ["stage-2"],
      });
      expect(state.config.editingConfig.stageData).toEqual(expectedStageData);
    });
  });

  describe("deleteStageNode()", () => {
    it("deletes a stage in middle of the pipeline", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0    2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.deleteStageNode("stage-1");

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toIncludeAllMembers([
        model.pipelineEditor.nodes[0],
        model.pipelineEditor.nodes[2],
      ]);
      expect(state.pipelineEditor.edges).toEqual([]);

      const { "stage-1": deleted, ...expectedStageData } = model.config.editingConfig.stageData;
      expect(state.config.editingConfig.stageData).toEqual(expectedStageData);
      expect(state.config.editingConfig.stageDeps).toEqual({ "stage-0": [], "stage-2": [] });
    });
  });

  describe("deleteStageEdge()", () => {
    it("deletes a stage edge", () => {
      // Stage graph: `0 -> 1 -> 2` ==> `0   1 -> 2`
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.deleteStageEdge("reactflow__edge-stage-0-stage-1");

      const state = store.getState();
      expect(state.pipelineEditor.nodes).toEqual(model.pipelineEditor.nodes);
      expect(state.pipelineEditor.edges).toEqual([
        { id: "reactflow__edge-stage-1-stage-2", source: "stage-1", target: "stage-2", type: "stage" },
      ]);
      expect(state.config.editingConfig.stageData).toEqual(model.config.editingConfig.stageData);
      expect(state.config.editingConfig.stageDeps).toEqual({
        "stage-0": [],
        "stage-1": [],
        "stage-2": ["stage-1"],
      });
    });
  });

  describe("duplicateStage()", () => {
    it("duplicates a stage given its ID", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.duplicateStage("stage-2");

      // Test stage data in `editingConfig`
      const state = store.getState();
      expect(state.config.editingConfig.stageDeps).toEqual({
        ...model.config.editingConfig.stageDeps,
        "stage-3": [],
      });
      expect(state.config.editingConfig.stageData).toEqual({
        ...model.config.editingConfig.stageData,
        "stage-3": { ...model.config.editingConfig.stageData["stage-2"], label: "allCopy" },
      });

      // Test React Flow data
      expect(state.pipelineEditor.nodes.length).toBe(4);
      expect(state.pipelineEditor.edges).toEqual(model.pipelineEditor.edges);
      const newNode = state.pipelineEditor.nodes[3];
      expect(newNode.id).toBe("stage-3");
      expect(newNode.data.name).toBe("Compile");
    });

    it("selects the duplicated node upon success", () => {
      const model = getThreeStageModel();
      // Mock that we've selected 3rd stage
      model.pipelineEditor.selectedStage = computed(() => ({
        id: "stage-2",
        name: "Compile",
        nameInUI: "Compile",
        label: "all",
      }));
      const store = createStore(model);
      store.getActions().pipelineEditor.duplicateStage("stage-0"); // Duplicate a non-selected stage

      const nodesSelected = store.getState().pipelineEditor.nodes.map((n) => n.selected);
      expect(nodesSelected).toEqual([false, false, false, true]);
    });

    it("does nothing if the stage ID is invalid", () => {
      jest.spyOn(console, "warn").mockImplementationOnce(() => {});
      const model = getThreeStageModel();
      const store = createStore(model);
      store.getActions().pipelineEditor.duplicateStage("foo");

      const state = store.getState();
      expect(state.config.editingConfig.stageDeps).toEqual(model.config.editingConfig.stageDeps);
      expect(state.config.editingConfig.stageData).toEqual(model.config.editingConfig.stageData);
      expect(state.pipelineEditor.nodes).toEqual(model.pipelineEditor.nodes);
      expect(state.pipelineEditor.edges).toEqual(model.pipelineEditor.edges);
    });
  });
});
