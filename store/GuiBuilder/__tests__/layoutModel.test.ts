import { createStore } from "easy-peasy";
import { layoutModel } from "../model/layoutModel";

describe("GuiBuilder Store - LayoutModel", () => {
  describe("setStep()", () => {
    it("sets the step given its slug", () => {
      const store = createStore(layoutModel);
      store.getActions().setStep("settings");
      expect(store.getState().step).toEqual(0);
    });
  });
});
