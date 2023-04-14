import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { ConfigDiagnostics } from "@/types/GuiBuilder";
import { act } from "@testing-library/react-hooks";
import { createStore } from "easy-peasy";
import useSelectedStageDiagnostics from "../useSelectedStageDiagnostics";
import renderHookWithContexts from "./utils/renderHookWithContexts";

/**
 * Get an example diagnostics object where the first stage (DiffWithSkeleton) has 2 diagnostics.
 */
const getDiagnostics = (): ConfigDiagnostics => ({
  _settings: [],
  stages: {
    "stage-0": [
      {
        type: "MISSING_FIELD_ERROR",
        message: "field '_settings.use_skeleton' is required but is missing. use_skeleton requires to be true",
        severity: "ERROR",
        location: { stage: "diffWithSkeleton" },
        resolved: false,
      },
      {
        type: "MISSING_FIELD_ERROR",
        message:
          "field '_settings.use_provided' is required but is missing. 'use_provided' is not true, but 'exclude_from_provided' is enabled",
        severity: "ERROR",
        location: { stage: "diffWithSkeleton" },
        resolved: false,
      },
    ],
  },
  others: [],
});

describe("GuiBuilder: useSelectedStageDiagnostics()", () => {
  describe("returns the selected stage's diagnostics and a resolve function", () => {
    test("if the selected stage has diagnostics", () => {
      const model = getThreeStageModel();
      model.config.diagnostics = getDiagnostics();
      model.pipelineEditor.nodes[0].selected = true; // select DiffWithSkeleton stage
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageDiagnostics(), { store });
      const [diagnostics, resolveDiagnostics] = result.current;

      expect(diagnostics).toStrictEqual(model.config.diagnostics.stages["stage-0"]);

      // Resolve the first diagnostic
      act(() => resolveDiagnostics((d) => d.type === "MISSING_FIELD_ERROR" && !!d.message.match(/use_skeleton/)));
      const stageDiagnosticsActual = store.getState().config.diagnostics.stages["stage-0"];
      expect(stageDiagnosticsActual[0].resolved).toBe(true);
      expect(stageDiagnosticsActual[1].resolved).toBe(false);
    });
  });

  describe("returns an empty array and a function doing nothing", () => {
    test("if no stage is selected", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes = model.pipelineEditor.nodes.map((node) => ({ ...node, selected: false }));
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageDiagnostics(), { store });
      const [diagnostics, resolveDiagnostics] = result.current;

      expect(diagnostics).toStrictEqual([]);

      act(() => resolveDiagnostics((_) => true));
      expect(store.getState().config.diagnostics).toStrictEqual(model.config.diagnostics);
    });

    test("if the selected stage has no diagnostics", () => {
      const model = getThreeStageModel();
      model.config.diagnostics = getDiagnostics();
      model.pipelineEditor.nodes[2].selected = true; // select Compile stage
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageDiagnostics(), { store });
      const [diagnostics, resolveDiagnostics] = result.current;

      expect(diagnostics).toStrictEqual([]);

      act(() => resolveDiagnostics((_) => true));
      expect(store.getState().config.diagnostics).toStrictEqual(model.config.diagnostics);
    });
  });
});
