import PyTestSettings from "@/components/GuiBuilder/StageSettings/PyTestSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { GuiBuilderModel } from "@/store/GuiBuilder";
import { PyTest, PyTestRaw } from "@/types/GuiBuilder";
import { createStore, Store } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

const getModelWithConfigStage = () => getModelWithSingleStage("PyTest", supportedStages.PyTest.defaultConfig);

/**
 * Obtain the current `PyTest` config from the store and converts it to a raw config.
 */
const getConfigRawFromStore = (store: Store<GuiBuilderModel>): PyTestRaw => {
  const configActual = store.getState().config.editingConfig.stageData["stage-0"].config as PyTest;
  const configActualRaw = supportedStages.PyTest.configToRaw!(configActual) as PyTestRaw;
  return configActualRaw;
};

/**
 * Sets a predicate row in the "Score Overrides" section of the "Weighted" scoring policy.
 * @param rowIndex Zero-based index of the predicate row to set.
 * @param input The text to type in each field.
 */
const setPredicateRow = (rowIndex: number, input: { key: string; op: string; value: string }): void => {
  cy.get('[data-cy="predicate-row-key"]').eq(rowIndex).click();
  cy.get("div.mantine-Select-item").contains(input.key).click();
  cy.get('[data-cy="predicate-row-op"]').eq(rowIndex).click();
  cy.get("div.mantine-Select-item").contains(input.op).click();
  cy.get('[data-cy="predicate-row-value-string"]').eq(rowIndex).clear().type(input.value);
};

describe("GuiBuilder: Stage Settings - PyTest", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
  });

  describe("setting the PyTest stage config", () => {
    it("sets the non-scoring policy fields", () => {
      const model = getModelWithConfigStage();
      const store = createStore(model);
      cy.mountWithStore(store, <PyTestSettings />);

      cy.get("button").contains("Edit Stage Configuration").click();
      cy.get("#args").type("-q");
      cy.get("#additional_pip_packages").type("numpy,pandas");
      cy.get("button").contains("Save & Close").click();

      cy.then(() => {
        const configActual = store.getState().config.editingConfig.stageData["stage-0"].config as PyTest;
        expect(configActual.args).to.equal("-q");
        expect(configActual.additional_pip_packages).to.deep.equal(["numpy", "pandas"]);
      });
    });

    it("handles Score-out-of-Total scoring policy", () => {
      const model = getModelWithConfigStage();
      const store = createStore(model);
      cy.mountWithStore(store, <PyTestSettings />);

      cy.get("button").contains("Edit Stage Configuration").click();
      cy.get("[role=radio]").contains("Score-out-of-Total").click();
      cy.get("#score").clear().type("100");
      cy.get("#treatDenormalScore").click();
      cy.get("div.mantine-Select-item").contains("This stage will get a score of 0").click();

      cy.then(() => {
        const configActualRaw = getConfigRawFromStore(store);
        const configExpectedRaw: PyTestRaw = {
          additional_pip_packages: [],
          args: [],
          score: 100,
          treatDenormalScore: "FAILURE",
        };
        expect(configActualRaw).to.deep.equal(configExpectedRaw);
      });
    });

    it("handles Weighted scoring policy", () => {
      const model = getModelWithConfigStage();
      const store = createStore(model);
      cy.mountWithStore(store, <PyTestSettings />);

      cy.get("button").contains("Edit Stage Configuration").click();
      cy.get("[role=radio]").contains("Weighted").click();

      cy.get("#scoreWeighting-default").clear().type("1");
      cy.get("#scoreWeighting-limit").clear();

      // Score Overrides
      cy.get("button").contains("Add Override").click();
      cy.get('[data-cy="predicate-score"]').clear().type("2");
      cy.get('[data-cy="predicate-joinPolicy"]').click();
      cy.get("div.mantine-Select-item").contains("any").click();
      setPredicateRow(0, { key: "Class name", op: "equals", value: "TestHard" });
      cy.get("button").contains("Add condition").click();
      setPredicateRow(1, { key: "Test case name", op: "matches regex", value: "test_hard" });

      cy.then(() => {
        const configActualRaw = getConfigRawFromStore(store);
        const configExpectedRaw: PyTestRaw = {
          additional_pip_packages: [],
          args: [],
          scoreWeighting: {
            default: 1,
            overrides: [
              {
                score: 2,
                joinPolicy: "OR",
                className: { op: "EQ", value: "TestHard" },
                testName: { op: "REGEX_EQ", value: "test_hard" },
              },
            ],
          },
        };
        expect(configActualRaw).to.deep.equal(configExpectedRaw);
      });
    });

    it("handles Disable scoring policy", () => {
      const model = getModelWithConfigStage();
      const store = createStore(model);
      cy.mountWithStore(store, <PyTestSettings />);

      cy.get("button").contains("Edit Stage Configuration").click();
      cy.get("[role=radio]").contains("Disable").click();

      cy.then(() => {
        const configActualRaw = getConfigRawFromStore(store);
        const configExpectedRaw: PyTestRaw = {
          additional_pip_packages: [],
          args: [],
        };
        expect(configActualRaw).to.deep.equal(configExpectedRaw);
      });
    });
  });
});
