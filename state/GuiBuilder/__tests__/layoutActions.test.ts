import { createStore } from "easy-peasy";
import { getThreeStageModel } from "./utils/storeTestUtils";

describe("GuiBuilder Store - LayoutActions", () => {
  describe("setStep()", () => {
    it("sets the step given its slug", () => {
      const store = createStore(getThreeStageModel());
      store.getActions().setStep("settings");
      expect(store.getState().layout.step).toEqual(0);
    });
  });
});
