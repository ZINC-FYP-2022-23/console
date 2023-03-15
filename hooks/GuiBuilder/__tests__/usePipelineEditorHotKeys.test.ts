import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { act } from "@testing-library/react-hooks";
import { createStore } from "easy-peasy";
import "jest-extended";
import usePipelineEditorHotKeys from "../usePipelineEditorHotKeys";
import renderHookWithStore from "./utils/renderHookWithStore";

const dispatchKeyboardEvent = (data: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", data);
  act(() => {
    document.documentElement.dispatchEvent(event);
  });
};

describe("GuiBuilder: usePipelineEditorHotKeys()", () => {
  describe("Backspace", () => {
    it("deletes the selected node", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[0].selected = true;
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "Backspace" });

      expect(store.getMockedActions()).toEqual([
        {
          type: "@action.layout.setModal",
          payload: { path: "deleteStage", value: true },
        },
      ]);
    });

    it("deletes the selected edge", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.edges[0].selected = true;
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "Backspace" });

      expect(store.getMockedActions()[0]).toEqual({
        type: "@thunk.pipelineEditor.deleteStageEdge(start)",
        payload: model.pipelineEditor.edges[0].id,
      });
    });

    it("does nothing if no node or edge is selected", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes = model.pipelineEditor.nodes.map((node) => ({ ...node, selected: false }));
      model.pipelineEditor.edges = model.pipelineEditor.edges.map((edge) => ({ ...edge, selected: false }));
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "Backspace" });

      expect(store.getMockedActions()).toEqual([]);
    });
  });

  describe("Ctrl/Cmd + C", () => {
    it("copies the selected node's ID", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[0].selected = true;
      const store = createStore(model);

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "c", ctrlKey: true });

      expect(store.getState().pipelineEditor.copiedStageId).toBe(model.pipelineEditor.nodes[0].id);
    });

    it("does nothing if no node is selected", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes = model.pipelineEditor.nodes.map((node) => ({ ...node, selected: false }));
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "c", ctrlKey: true });

      expect(store.getMockedActions()).toEqual([]);
    });
  });

  describe("Ctrl/Cmd + V", () => {
    it("pastes the copied node", () => {
      const model = getThreeStageModel();
      const copiedId = model.pipelineEditor.nodes[0].id;
      model.pipelineEditor.copiedStageId = copiedId;
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "v", ctrlKey: true });

      expect(store.getMockedActions()).toIncludeAllMembers([
        {
          type: "@thunk.pipelineEditor.duplicateStage(start)",
          payload: copiedId,
        },
        {
          type: "@action.pipelineEditor.setCopiedStageId",
          payload: undefined,
        },
      ]);
    });

    it("does nothing if there is no copied node", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.copiedStageId = undefined;
      const store = createStore(model, { mockActions: true });

      renderHookWithStore(store, () => usePipelineEditorHotKeys());
      dispatchKeyboardEvent({ key: "v", ctrlKey: true });

      expect(store.getMockedActions()).toEqual([]);
    });
  });
});
