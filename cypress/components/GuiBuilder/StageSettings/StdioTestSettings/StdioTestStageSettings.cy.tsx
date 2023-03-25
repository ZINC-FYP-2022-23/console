import { StdioTestStageSettings } from "@/components/GuiBuilder/StageSettings/StdioTestSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { StdioTest } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../../utils";

const getModelWithConfigStage = () => getModelWithSingleStage("StdioTest", supportedStages.StdioTest.defaultConfig);

describe("GuiBuilder: <StdioTestStageSettings />", () => {
  beforeEach(() => {
    cy.viewport(900, 400);
  });

  it("sets the overall settings of the StdioTest stage", () => {
    const model = getModelWithConfigStage();
    const store = createStore(model);
    cy.mountWithStore(store, <StdioTestStageSettings />);

    cy.get("#diff_ignore_flags").click();
    cy.get("li").contains("Trailing whitespace").click();
    cy.get("li").contains("Space change").click().clickOutside();
    cy.get("#additional_packages").type("curl,");

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: StdioTest = {
        diff_ignore_flags: ["TRAILING_WHITESPACE", "SPACE_CHANGE"],
        additional_packages: ["curl"],
        additional_pip_packages: [],
        testCases: [],
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  describe("Additional pip packages", () => {
    it("is disabled when the config does not use Python", () => {
      const model = getModelWithConfigStage();
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
      const model = getModelWithConfigStage();
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
});
