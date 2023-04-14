import { StdioTestStageSettings } from "@/components/GuiBuilder/StageSettings/StdioTestSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { StdioTest, StdioTestRaw } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../../utils";

describe("GuiBuilder: <StdioTestStageSettings />", () => {
  beforeEach(() => {
    cy.viewport(900, 400);
  });

  it("sets the overall settings of the StdioTest stage", () => {
    const model = getModelWithSingleStage("StdioTest");
    const store = createStore(model);
    cy.mountWithStore(store, <StdioTestStageSettings />);

    cy.clickMultiSelectInput("#diff_ignore_flags", ["Trailing whitespace", "Space change"]);
    cy.get("#additional_packages").type("curl,");

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: StdioTest = {
        diff_ignore_flags: ["TRAILING_WHITESPACE", "SPACE_CHANGE"],
        additional_packages: ["curl"],
        additional_pip_packages: [],
        testCases: [],
        experimentalModularize: false,
        generate_expected_output: false,
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  describe("Additional pip packages", () => {
    it("is disabled when the config does not use Python", () => {
      const model = getModelWithSingleStage("StdioTest");
      const store = createStore(model);
      cy.mountWithStore(store, <StdioTestStageSettings />);

      cy.get("#additional_pip_packages input").should("be.disabled");

      cy.get("#additional_packages").type("python3-pip,");
      cy.get("#additional_pip_packages input").should("not.be.disabled").type("numpy,");
      cy.then(() => {
        const configActual = store.getState().config.editingConfig.stageData["stage-0"].config as StdioTest;
        expect(configActual.additional_packages).to.deep.equal(["python3-pip"]);
        expect(configActual.additional_pip_packages).to.deep.equal(["numpy"]);
      });
    });

    it("is enabled when the config uses Python", () => {
      const model = getModelWithSingleStage("StdioTest");
      model.config.editingConfig._settings.lang = {
        language: "python",
        compiler: null,
        version: "3.8",
      };
      const store = createStore(model);
      cy.mountWithStore(store, <StdioTestStageSettings />);

      cy.get("#additional_pip_packages input").should("not.be.disabled");
    });
  });

  describe("Auto-generate expected output of test cases", () => {
    it("enables the feature flags when enabled", () => {
      const model = getModelWithSingleStage("StdioTest");
      const store = createStore(model);
      cy.mountWithStore(store, <StdioTestStageSettings />);

      cy.get("#generate_expected_output").click();

      // `_settings.use_generated` is false by default so there should be an alert
      cy.get('[data-cy="use-generated-off-alert"]').should("be.visible");
      cy.get('[data-cy="use-generated-off-alert"] button').click();

      cy.then(() => {
        const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
        const configActualRaw = supportedStages.StdioTest.configToRaw!(configActual) as StdioTestRaw;
        const configExpectedRaw: StdioTestRaw = {
          diff_ignore_flags: [],
          additional_packages: [],
          additional_pip_packages: [],
          testCases: [],
          experimentalModularize: true,
          generate_expected_output: true,
        };
        expect(configActualRaw).to.deep.equal(configExpectedRaw);
      });
    });
  });
});
