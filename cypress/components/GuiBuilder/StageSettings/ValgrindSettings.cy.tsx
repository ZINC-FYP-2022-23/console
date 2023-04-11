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
    cy.clickSelectInput("#visibility", "Always visible");
    cy.clickMultiSelectInput("#checksFilter", ["All Valgrind errors", "Memory leaks"]);
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

  describe("Diagnostics", () => {
    it("handles the pipeline has no StdioTest stage", () => {
      const model = getModelWithSingleStage("Valgrind");
      const store = createStore(model);
      cy.mountWithStore(store, <ValgrindSettings />);

      cy.get('[data-cy="missing-stdiotest-alert"]').should("be.visible").and("have.attr", "data-severity", "warning");

      cy.then(() => {
        store.getActions().config.parseDiagnostics([
          {
            type: "MISSING_FIELD_ERROR",
            severity: "ERROR",
            message:
              "field 'stdioTest' is required but is missing at [valgrind]. Valgrind stage depends on the StdioTest or Run stage",
            field: "stdioTest",
            details: "Valgrind stage depends on the StdioTest or Run stage",
            location: {
              stage: "valgrind",
            },
          },
        ]);
      });
      cy.get('[data-cy="missing-stdiotest-alert"]').should("be.visible").and("have.attr", "data-severity", "error");
    });
  });
});
