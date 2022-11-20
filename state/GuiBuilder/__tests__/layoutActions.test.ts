import { createStore } from "easy-peasy";
import { getThreeStageModel } from "./utils/storeTestUtils";

describe("GuiBuilder Store - LayoutActions", () => {
  describe("setStep()", () => {
    it("sets the step if it's in range", () => {
      const store = createStore(getThreeStageModel());
      store.getActions().setStep(1);
      expect(store.getState().layout.step).toEqual(1);
    });

    it("does nothing if the step is out of range", () => {
      const model = getThreeStageModel();
      const store = createStore(model);
      const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();

      store.getActions().setStep(-1);
      expect(store.getState().layout.step).not.toBe(-1);
      store.getActions().setStep(10);
      expect(store.getState().layout.step).not.toBe(10);

      consoleWarnMock.mockRestore();
    });
  });
});
