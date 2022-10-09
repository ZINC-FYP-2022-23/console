import { getStageType } from "../stage";

describe("Stage utils", () => {
  it("gets the stage type", () => {
    const stdioTest = {
      id: "stdioTest",
      config: {},
    };
    expect(getStageType(stdioTest)).toBe("StdioTest");

    const compileMain = {
      id: "compile:main",
      config: {},
    };
    expect(getStageType(compileMain)).toBe("Compile");
  });
});
