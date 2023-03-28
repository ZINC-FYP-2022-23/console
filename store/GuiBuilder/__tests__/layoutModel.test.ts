import { createStore } from "easy-peasy";
import { layoutModel } from "../model/layoutModel";

describe("GuiBuilder: Store - LayoutModel", () => {
  test("stepIndex", () => {
    const store = createStore(layoutModel);
    store.getActions().setStep("pipeline");
    expect(store.getState().stepIndex).toEqual(1);
  });
});
