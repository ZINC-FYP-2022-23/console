/// <reference types="jest-extended" />
import { StageDataMap, StageKind, StageNode } from "@types";
import { createStore } from "easy-peasy";
import "jest-extended";
import * as uuid from "uuid";
import { getThreeStageModel } from "./utils/storeTestUtils";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue("stage-3");

describe("GuiBuilder Store - PipelineEditorActions", () => {
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
});
