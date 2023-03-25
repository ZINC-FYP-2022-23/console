import MakeSettings from "@/components/GuiBuilder/StageSettings/MakeSettings";
import { Make } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

describe("GuiBuilder: Stage Settings - Make", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Make stage config", () => {
    const model = getModelWithSingleStage("Make");
    const store = createStore(model);
    cy.mountWithStore(store, <MakeSettings />);

    cy.get("#targets").type("hello world");
    cy.get("#args").type("-f Makefile");
    cy.get("#additional_packages").type("curl").clickOutside();

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: Make = {
        targets: ["hello", "world"],
        args: "-f Makefile",
        additional_packages: ["curl"],
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });
});
