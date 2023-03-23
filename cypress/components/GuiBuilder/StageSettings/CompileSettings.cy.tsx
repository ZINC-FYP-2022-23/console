import CompileSettings from "@/components/GuiBuilder/StageSettings/CompileSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { Compile } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

const getModelWithConfigStage = () => getModelWithSingleStage("Compile", supportedStages.Compile.defaultConfig);

describe("GuiBuilder: Stage Settings - Compile", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Compile stage config", () => {
    const model = getModelWithConfigStage();
    const store = createStore(model);
    cy.mountWithStore(store, <CompileSettings />);

    cy.get("#input").type("a.cpp,b.cpp");
    cy.get("#output").type("a.out");
    cy.get("#flags").type("-std=c+11 -pedantic");
    cy.get("#additional_packages").type("curl").clickOutside();

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: Compile = {
        input: ["a.cpp", "b.cpp"],
        output: "a.out",
        flags: "-std=c+11 -pedantic",
        additional_packages: ["curl"],
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  it("disables the `output` field if Java is used", () => {
    const model = getModelWithConfigStage();
    model.config.editingConfig._settings.lang = {
      language: "java",
      compiler: null,
      version: "11",
    };
    const store = createStore(model);
    cy.mountWithStore(store, <CompileSettings />);

    cy.get("#output").should("be.disabled");
  });
});
