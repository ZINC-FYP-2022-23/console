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

  describe("Diagnostics", () => {
    it("handles `_settings.use_skeleton` is not true", () => {
      const model = getModelWithSingleStage("DiffWithSkeleton");
      model.config.editingConfig._settings.use_skeleton = false;
      const store = createStore(model);
      cy.mountWithStore(store, <DiffWithSkeletonSettings />);

      cy.get('[data-cy="use-skeleton-off-alert"]').should("be.visible").and("have.attr", "data-severity", "warning");

      cy.then(() => {
        store.getActions().config.parseDiagnostics([
          {
            type: "MISSING_FIELD_ERROR",
            message:
              "field '_settings.use_skeleton' is required but is missing at [diffWithSkeleton]. use_skeleton requires to be true",
            severity: "ERROR",
            field: "_settings.use_skeleton",
            details: "use_skeleton requires to be true",
            location: {
              stage: "diffWithSkeleton",
            },
          },
        ]);
      });
      cy.get('[data-cy="use-skeleton-off-alert"]').should("be.visible").and("have.attr", "data-severity", "error");

      // Click the button to enable `use_skeleton`
      cy.get("button").contains("Click me to enable").click();
      cy.then(() => {
        const useSkeleton = store.getState().config.editingConfig._settings.use_skeleton;
        expect(useSkeleton).to.equal(true);
      });

      // The warning should be gone
      cy.get('[data-cy="use-skeleton-off-alert"]').should("not.exist");
    });

    it("handles `exclude_from_provided` is true but `_settings.use_provided` is false", () => {
      const model = getModelWithSingleStage("DiffWithSkeleton");
      model.config.editingConfig._settings.use_skeleton = true;
      model.config.editingConfig._settings.use_provided = false;
      const store = createStore(model);
      cy.mountWithStore(store, <DiffWithSkeletonSettings />);

      cy.get('[data-cy="use-provided-off-alert"]').should("be.visible").and("have.attr", "data-severity", "warning");

      cy.then(() => {
        store.getActions().config.parseDiagnostics([
          {
            type: "MISSING_FIELD_ERROR",
            message:
              "field '_settings.use_provided' is required but is missing at [diffWithSkeleton]. 'use_provided' is not true, but 'exclude_from_provided' is enabled",
            severity: "ERROR",
            field: "_settings.use_provided",
            details: "'use_provided' is not true, but 'exclude_from_provided' is enabled",
            location: {
              stage: "diffWithSkeleton",
            },
          },
        ]);
      });
      cy.get('[data-cy="use-provided-off-alert"]').should("be.visible").and("have.attr", "data-severity", "error");

      // Click the button to enable `use_provided`
      cy.get("button").contains("Click me to enable").click();
      cy.then(() => {
        const useProvided = store.getState().config.editingConfig._settings.use_provided;
        expect(useProvided).to.equal(true);
      });

      // The warning should be gone
      cy.get('[data-cy="use-provided-off-alert"]').should("not.exist");
    });
  });
});
