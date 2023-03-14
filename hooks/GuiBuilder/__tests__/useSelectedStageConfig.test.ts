import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { act } from "@testing-library/react-hooks";
import { createStore } from "easy-peasy";
import useSelectedStageConfig from "../useSelectedStageConfig";
import renderHookWithContexts from "./utils/renderHookWithContexts";

describe("GuiBuilder: useSelectedStageConfig()", () => {
  describe("returns the selected stage's config and its update function", () => {
    test("if the selected stage's name matches the given stage name", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[0].selected = true; // Select 1st stage (DiffWithSkeleton)
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageConfig("DiffWithSkeleton"), { store });
      const [config, setConfig] = result.current;

      expect(config).toStrictEqual(model.config.editingConfig.stageData["stage-0"].config);

      const newConfig = { exclude_from_provided: false };
      act(() => setConfig(newConfig));
      expect(store.getState().config.editingConfig.stageData["stage-0"].config).toStrictEqual(newConfig);
    });

    test("if a stage is selected but we didn't provide the stage name", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[0].selected = true; // Select 1st stage (DiffWithSkeleton)
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageConfig(), { store });
      const [config, setConfig] = result.current;

      expect(config).toStrictEqual(model.config.editingConfig.stageData["stage-0"].config);

      const newConfig = { exclude_from_provided: false };
      act(() => setConfig(newConfig));
      expect(store.getState().config.editingConfig.stageData["stage-0"].config).toStrictEqual(newConfig);
    });
  });

  describe("returns null and a function doing nothing", () => {
    test("if no stage is selected", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes = model.pipelineEditor.nodes.map((node) => ({ ...node, selected: false }));
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageConfig("DiffWithSkeleton"), { store });
      const [config, setConfig] = result.current;

      expect(config).toBeNull();

      act(() => setConfig({ exclude_from_provided: false }));
      expect(store.getState().config.editingConfig.stageData).toStrictEqual(model.config.editingConfig.stageData);
    });

    test("if the selected stage's name does not match the given stage name", () => {
      const model = getThreeStageModel();
      model.pipelineEditor.nodes[1].selected = true; // Select the 2nd stage (FileStructureValidation)
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSelectedStageConfig("DiffWithSkeleton"), { store });
      const [config, setConfig] = result.current;

      expect(config).toBeNull();

      // We pass "DiffWithSkeleton" as the argument to useSelectedStageConfig() to specify that we expect
      // the selected stage is DiffWithSkeleton. Since the actual selected stage is FileStructureValidation,
      // the update function should do nothing to avoid unexpected changes.
      act(() => setConfig({ exclude_from_provided: false }));
      expect(store.getState().config.editingConfig.stageData).toStrictEqual(model.config.editingConfig.stageData);
    });
  });
});
