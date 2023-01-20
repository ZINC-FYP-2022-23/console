import { getThreeStageModel } from "@store/GuiBuilder/__tests__/utils/storeTestUtils";
import { act } from "@testing-library/react-hooks";
import { createStore } from "easy-peasy";
import useSelectedStageConfig from "../useSelectedStageConfig";
import renderHookWithStore from "./utils/renderHookWithStore";

describe("GuiBuilder: useSelectedStageConfig()", () => {
  it("returns the selected stage's config and its update function", () => {
    const model = getThreeStageModel();
    model.pipelineEditor.nodes[0].selected = true;
    const store = createStore(model);

    const { result } = renderHookWithStore(store, () => useSelectedStageConfig());
    const [config, setConfig] = result.current;

    expect(config).toStrictEqual(model.config.editingConfig.stageData["stage-0"].config);

    const newConfig = { exclude_from_provided: false };
    act(() => setConfig(newConfig));
    expect(store.getState().config.editingConfig.stageData["stage-0"].config).toStrictEqual(newConfig);
  });

  it("returns undefined and a function doing nothing if no stages are selected", () => {
    const model = getThreeStageModel();
    model.pipelineEditor.nodes = model.pipelineEditor.nodes.map((node) => ({ ...node, selected: false }));
    const store = createStore(model);
    const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHookWithStore(store, () => useSelectedStageConfig());
    const [config, setConfig] = result.current;

    expect(config).toBeUndefined();

    const newConfig = { exclude_from_provided: false };
    act(() => setConfig(newConfig));
    expect(store.getState().config.editingConfig.stageData["stage-0"].config).toStrictEqual(
      model.config.editingConfig.stageData["stage-0"].config,
    );

    consoleWarnMock.mockRestore();
  });
});
