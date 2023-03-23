import CompileSettings from "@/components/GuiBuilder/StageSettings/CompileSettings";
import { Compile } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

const compileEmpty: Compile = {
  input: [],
  additional_packages: [],
};

describe("GuiBuilder: Stage Settings - Compile", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the Compile stage config", () => {
    const model = getModelWithSingleStage("Compile", compileEmpty);
    const store = createStore(model);
    cy.mountWithStore(store, <CompileSettings />);

    cy.get("#input").type("a.cpp,b.cpp");
    cy.get("#output").type("a.out");
    cy.get("#flags").type("-std=c+11 -pedantic");
    cy.get("#additional_packages").type("curl").clickOutside();

    cy.then(() => {
      const compileActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const compileExpected: Compile = {
        input: ["a.cpp", "b.cpp"],
        output: "a.out",
        flags: "-std=c+11 -pedantic",
        additional_packages: ["curl"],
      };
      expect(compileActual).to.deep.equal(compileExpected);
    });
  });

  it("disables the `output` field if Java is used", () => {
    const model = getModelWithSingleStage("Compile", compileEmpty);
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
