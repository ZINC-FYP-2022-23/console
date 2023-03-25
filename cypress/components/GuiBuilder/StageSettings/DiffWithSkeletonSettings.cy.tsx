import DiffWithSkeletonSettings from "@/components/GuiBuilder/StageSettings/DiffWithSkeletonSettings";
import { DiffWithSkeleton } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithSingleStage } from "../utils";

describe("GuiBuilder: Stage Settings - DiffWithSkeleton", () => {
  beforeEach(() => {
    cy.viewport(750, 400);
  });

  it("sets the DiffWithSkeleton stage config", () => {
    const model = getModelWithSingleStage("DiffWithSkeleton");
    model.config.editingConfig._settings.use_skeleton = true;
    const store = createStore(model);
    cy.mountWithStore(store, <DiffWithSkeletonSettings />);

    cy.get("#exclude_from_provided").click();

    cy.then(() => {
      const configActual = store.getState().config.editingConfig.stageData["stage-0"].config;
      const configExpected: DiffWithSkeleton = {
        exclude_from_provided: false,
      };
      expect(configActual).to.deep.equal(configExpected);
    });
  });

  it("shows a warning when `_settings.use_skeleton` is not true", () => {
    const model = getModelWithSingleStage("DiffWithSkeleton");
    model.config.editingConfig._settings.use_skeleton = false;
    const store = createStore(model);
    cy.mountWithStore(store, <DiffWithSkeletonSettings />);

    cy.get("p")
      .contains('Please enable the "Provide skeleton code to students" option in the Pipeline Settings.')
      .should("be.visible");

    // Click the button to enable `use_skeleton`
    cy.get("button").contains("Click me to enable").click();
    cy.then(() => {
      const useSkeleton = store.getState().config.editingConfig._settings.use_skeleton;
      expect(useSkeleton).to.equal(true);
    });

    // The warning should be gone
    cy.get("p").contains("Please enable").should("not.exist");
  });
});
