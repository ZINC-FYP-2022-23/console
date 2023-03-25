import ValgrindSettings from "@/components/GuiBuilder/StageSettings/ValgrindSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { Valgrind } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";
import { getModelWithStdioTestStage } from "./StdioTestSettings/utils";

describe("GuiBuilder: Stage Settings - Make", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Valgrind stage config", () => {
    const model = getModelWithStdioTestStage(undefined, supportedStages.Valgrind.defaultConfig);
    model.pipelineEditor.nodes[0].selected = false;
    model.pipelineEditor.nodes[1].selected = true;
    const store = createStore(model);
    cy.mountWithStore(store, <ValgrindSettings />);

    cy.get("#score").type("5");
    cy.get("#visibility").click();
    cy.get("div.mantine-Select-item").contains("Always visible").click();
    cy.get("#checksFilter").click();
    cy.get("li").contains("All Valgrind errors").click();
    cy.get("li").contains("Memory leaks").click().clickOutside();
    cy.get("#args").type("-v");

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-1"].config as Valgrind;
      const configExpected: Valgrind = {
        enabled: true,
        score: 5,
        visibility: "ALWAYS_VISIBLE",
        checksFilter: ["Leak_*"],
        args: "-v",
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  it("shows a warning if the pipeline has no StdioTest stage", () => {
    const model = getModelWithSingleStage("Valgrind", supportedStages.Valgrind.defaultConfig);
    const store = createStore(model);
    cy.mountWithStore(store, <ValgrindSettings />);

    cy.get('[data-cy="missing-stdiotest-alert"]').should("be.visible");
  });
});
