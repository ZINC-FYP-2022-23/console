import FileStructureValidationSettings from "@/components/GuiBuilder/StageSettings/FileStructureValidationSettings";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { FileStructureValidation, SettingsUseTemplate } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

const getModelWithConfigStage = () =>
  getModelWithSingleStage("FileStructureValidation", supportedStages.FileStructureValidation.defaultConfig);

describe("GuiBuilder: Stage Settings - FileStructureValidation", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the FileStructureValidation stage config", () => {
    const model = getModelWithConfigStage();
    model.config.editingConfig._settings.use_template = SettingsUseTemplate.PATH;
    const store = createStore(model);
    cy.mountWithStore(store, <FileStructureValidationSettings />);

    cy.get('button[title="New item"]').click();
    cy.get("#ignore_in_submission input").type("sum.h{Enter}*.out");

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: FileStructureValidation = {
        ignore_in_submission: ["sum.h", "*.out"],
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  it("shows a warning if `_settings.use_template` is undefined", () => {
    const model = getModelWithConfigStage();
    model.config.editingConfig._settings.use_template = undefined;
    const store = createStore(model);
    cy.mountWithStore(store, <FileStructureValidationSettings />);

    cy.get("p")
      .contains('Please set "Specify files that students should submit" to another value')
      .should("be.visible");
    cy.get("button").contains("Fix this field").should("be.visible");
  });

  it("shows a warning if the file/directory is ignored by default", () => {
    const model = getModelWithConfigStage();
    model.config.editingConfig._settings.use_template = SettingsUseTemplate.PATH;
    const store = createStore(model);
    cy.mountWithStore(store, <FileStructureValidationSettings />);

    cy.get('button[title="New item"]').click();
    cy.get("#ignore_in_submission input").type(".DS_Store");

    cy.get("span").contains("This item is always ignored by default").should("be.visible");
  });
});
