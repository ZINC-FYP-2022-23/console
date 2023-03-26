import ShellExecSettings from "@/components/GuiBuilder/StageSettings/ShellExecSettings";
import { ShellExec } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

describe("GuiBuilder: Stage Settings - ShellExec", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the ShellExec stage config", () => {
    const model = getModelWithSingleStage("ShellExec");
    const store = createStore(model);
    cy.mountWithStore(store, <ShellExecSettings />);

    cy.get("#cmd").type("touch foo.txt");
    cy.get("#additional_packages").type("neofetch").clickOutside();

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: ShellExec = {
        cmd: "touch foo.txt",
        additional_packages: ["neofetch"],
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });
});
