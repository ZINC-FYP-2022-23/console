import { DiagnosticRaw } from "@/types/GuiBuilder";
import { aliasGqlOperation } from "cypress/e2e/utils/graphql";
import { assignmentConfig } from "mocks/handlers/configs/cppConfig";

describe("GuiBuilder: General Settings step", () => {
  it("populates input fields from an existing C++ config", () => {
    cy.addMockHandlers("cppConfig");
    cy.visit("/assignments/1/configs/1/gui?step=settings");

    // Pipeline Settings
    cy.get("#lang").should("have.value", "C++ (g++)");
    cy.get("#lang_version").should("have.value", 8);

    cy.get("#use_skeleton").should("have.attr", "aria-checked", "true");
    cy.get("#use_provided").should("have.attr", "aria-checked", "true");
    cy.get("#use_template").should("have.value", "Text input");
    cy.get("#use-template-filenames input").should("have.value", "fibonacci.cpp");

    cy.get("#early_return_on_throw").should("have.attr", "aria-checked", "false");
    cy.get("#network").should("have.attr", "aria-checked", "false");
    cy.get("#stage_wait_duration_secs").should("have.value", 10);
    cy.get("#cpus").should("have.value", "1.0");
    cy.get("#gpus").should("have.value", "None");
    cy.get("#mem_gb").should("have.value", "1.0");

    // Policy
    cy.get("#attemptLimits").should("have.value", "");
    cy.get("#gradeImmediately").should("have.attr", "aria-checked", "true");
    cy.get("#showImmediateScores").should("have.attr", "aria-checked", "true");

    // Scheduling
    cy.get("#showAt").should("have.value", "April 1, 2023 12:00 PM");
    cy.get("#startCollectionAt").should("have.value", "April 1, 2023 12:00 PM");
    cy.get("#dueAt").should("have.value", "May 1, 2023 12:00 PM");
    cy.get("#stopCollectionAt").should("have.value", "May 2, 2023 12:00 PM");
    cy.get("#releaseGradeAt").should("not.exist"); // since gradeImmediately is true
  });

  describe("Next step", () => {
    it("shows an error notification if settings YAML fails validation", () => {
      cy.addMockHandlers("newConfig");
      cy.visit("/assignments/1/configs/new/gui?step=settings");

      const diagnosticsRaw: DiagnosticRaw[] = [
        {
          type: "LANG_FORMAT_ERROR",
          message: "field '_settings.lang' is invalid. Correct format: $lang[$/compiler]:$version",
          severity: "ERROR",
          location: { stage: "_settings" },
        },
      ];
      cy.intercept("/api/configs/draft/validate", { id: "1", configError: JSON.stringify(diagnosticsRaw) });

      cy.get("#lang_version").clear();
      cy.get('button[data-cy="next-step"]').click();

      cy.get("p").contains("Error in General Settings").should("be.visible");
      cy.url().should("include", "step=settings"); // Stay on the same step
    });

    it("creates the config if user is creating a new config", () => {
      cy.addMockHandlers("newConfig");
      cy.visit("/assignments/1/configs/new/gui?step=settings");

      cy.intercept("/api/configs/draft/validate", { id: "1", configError: null });
      cy.intercept("POST", "/v1/graphql", (req) => {
        aliasGqlOperation(req, "createAssignmentConfig", () => {
          req.reply({
            data: { createAssignmentConfig: { id: 1 } },
          });
        });
      });

      cy.get("#lang_version").type("8");
      cy.get('button[data-cy="next-step"]').click();

      cy.wait("@gql_createAssignmentConfig").its("response.body.data.createAssignmentConfig.id").should("eq", 1);
      cy.url().should("include", "/assignments/1/configs/1/gui?step=pipeline"); // Visit next step
    });

    it("updates the policy and schedule if user is editing an existing config", () => {
      cy.addMockHandlers("cppConfig");
      cy.visit("/assignments/1/configs/1/gui?step=settings");

      cy.intercept("/api/configs/draft/validate", { id: "1", configError: null });
      cy.intercept("POST", "/v1/graphql", (req) => {
        aliasGqlOperation(req, "updateAssignmentConfig", () => {
          req.reply({
            data: { updateAssignmentConfig: { id: 1 } },
          });
        });
      });

      cy.get('button[data-cy="next-step"]').click();

      const { config_yaml: _, ...expectedUpdateVars } = assignmentConfig;

      cy.wait("@gql_updateAssignmentConfig").its("request.body.variables.update").should("deep.eq", expectedUpdateVars);
      cy.url().should("include", "step=pipeline"); // Visit next step
    });
  });
});
