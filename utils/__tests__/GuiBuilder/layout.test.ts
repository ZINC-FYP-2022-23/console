import { getNextStepSlug } from "../../GuiBuilder/layout";

describe("GuiBuilder: Utils - Layout", () => {
  test("getNextStepSlug()", () => {
    expect(getNextStepSlug("settings")).toBe("pipeline");
    expect(getNextStepSlug("pipeline")).toBe("upload");
    expect(getNextStepSlug("assign")).toBe(null);
  });
});
