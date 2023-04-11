import ScoreSettings from "@/components/GuiBuilder/StageSettings/ScoreSettings";
import { Score } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

describe("GuiBuilder: Stage Settings - Score", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Score stage config", () => {
    const model = getModelWithSingleStage("Score");
    const store = createStore(model);
    cy.mountWithStore(store, <ScoreSettings />);

    cy.get("#normalizedTo").type("100");
    cy.get("#minScore").type("0");
    cy.get("#maxScore").type("100");

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: Score = {
        normalizedTo: 100,
        minScore: 0,
        maxScore: 100,
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  it("shows an error if minScore > maxScore", () => {
    const model = getModelWithSingleStage("Score");
    const store = createStore(model);
    cy.mountWithStore(store, <ScoreSettings />);

    cy.get("#minScore").type("100");
    cy.get("#maxScore").type("0");

    cy.get("p").contains("Min value should be smaller than Max value").should("be.visible");
  });

  it("shows an alert if the pipeline does not have Grading stages", () => {
    // In this model, the pipeline does not have Grading stages since it only has a single Score stage
    const model = getModelWithSingleStage("Score");
    const store = createStore(model);
    cy.mountWithStore(store, <ScoreSettings />);

    cy.get('[data-cy="no-grading-stage-alert"]').should("be.visible");
  });
});
