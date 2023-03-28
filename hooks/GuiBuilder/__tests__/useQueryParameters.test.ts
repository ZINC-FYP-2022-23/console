import guiBuilderSteps, { GuiBuilderStepSlug } from "@/components/GuiBuilder/Steps/GuiBuilderSteps";
import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { act } from "@testing-library/react-hooks";
import { createStore } from "easy-peasy";
import mockRouter from "next-router-mock";
import useQueryParameters from "../useQueryParameters";
import renderHookWithContexts from "./utils/renderHookWithContexts";

// See https://github.com/scottrippey/next-router-mock
jest.mock("next/router", () => require("next-router-mock"));

describe("GuiBuilder: useQueryParameters()", () => {
  describe("initializeStateFromQueryParams()", () => {
    it("processes the `step` query parameter", () => {
      const step: GuiBuilderStepSlug = "pipeline";
      mockRouter.push(`/assignments/1/configs/1/gui?step=${step}`);

      const model = getThreeStageModel();
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useQueryParameters(), { store });
      const { initializeStateFromQueryParams } = result.current;
      act(() => initializeStateFromQueryParams());

      expect(store.getState().layout.step).toBe(step);
    });

    it("resets `step` query parameter to first step when creating a new config", () => {
      const step: GuiBuilderStepSlug = "pipeline";
      mockRouter.push(`/assignments/1/configs/new/gui?step=${step}`);

      const model = getThreeStageModel();
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useQueryParameters(), { store });
      const { initializeStateFromQueryParams } = result.current;
      act(() => initializeStateFromQueryParams());

      const firstStepSlug = guiBuilderSteps[0].slug;
      expect(store.getState().layout.step).toBe(firstStepSlug);
      expect(mockRouter.query.step).toBe(firstStepSlug);
    });
  });

  test("updateStep()", () => {
    mockRouter.push(`/assignments/1/configs/1/gui?step=settings`);

    const model = getThreeStageModel();
    const store = createStore(model);

    const { result } = renderHookWithContexts(() => useQueryParameters(), { store });
    const { updateStep } = result.current;
    const stepNew: GuiBuilderStepSlug = "pipeline";
    act(() => updateStep(stepNew));

    expect(store.getState().layout.step).toBe(stepNew);
    expect(mockRouter.query.step).toBe(stepNew);
  });
});
