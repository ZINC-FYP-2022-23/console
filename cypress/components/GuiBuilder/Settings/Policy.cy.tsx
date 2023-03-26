import Policy from "@/components/GuiBuilder/Settings/Policy";
import { guiBuilderModel } from "@/store/GuiBuilder";
import { createStore } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";

describe("GuiBuilder - <Policy />", () => {
  it("sets the grading policy", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    cy.mountWithStore(store, <Policy />);

    cy.get("#attemptLimits").clear().type("10");
    cy.get("#gradeImmediately").click();
    cy.get("#showImmediateScores").click();

    cy.then(() => {
      const policy = store.getState().config.editingPolicy;
      expect(policy).to.deep.equal({
        attemptLimits: 10,
        gradeImmediately: true,
        showImmediateScores: true,
      });
    });

    // Unlimited attempt limits
    cy.get("#attemptLimits").clear();
    cy.then(() => {
      const policy = store.getState().config.editingPolicy;
      expect(policy.attemptLimits).to.be.null;
    });
  });
});
