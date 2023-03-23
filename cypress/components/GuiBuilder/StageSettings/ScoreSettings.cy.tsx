import ScoreSettings from "@/components/GuiBuilder/StageSettings/ScoreSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { Score } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

const getModelWithConfigStage = () => getModelWithSingleStage("Score", supportedStages.Score.defaultConfig);

describe("GuiBuilder: Stage Settings - Score", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Score stage config", () => {
    const model = getModelWithConfigStage();
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
    const model = getModelWithConfigStage();
    const store = createStore(model);
    cy.mountWithStore(store, <ScoreSettings />);

    cy.get("#minScore").type("100");
    cy.get("#maxScore").type("0");

    cy.get("p").contains("Min value should be smaller than Max value").should("be.visible");
  });
});
