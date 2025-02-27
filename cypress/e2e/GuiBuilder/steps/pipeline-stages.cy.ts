import { aliasGqlOperation } from "cypress/e2e/utils/graphql";

describe("GuiBuilder: Pipeline Stages step", () => {
  it("constructs the pipeline from an existing C++ config", () => {
    cy.addMockHandlers("cppConfig");
    cy.visit("/assignments/1/configs/1/gui?step=pipeline");

    cy.get(".stage-node").as("stageNodes").should("have.length", 5);

    // 1. Diff With Skeleton
    cy.get("@stageNodes").eq(0).should("have.attr", "data-label", "Diff With Skeleton").click();
    cy.get("#stage-label").should("have.value", "");
    cy.get("#exclude_from_provided").should("have.attr", "aria-checked", "true");

    // 2. File Structure Validation
    cy.get("@stageNodes").eq(1).should("have.attr", "data-label", "File Structure Validation").click();
    cy.get("#stage-label").should("have.value", "");
    cy.get("#ignore_in_submission input").then((items) => {
      expect(items).to.have.length(2);
      expect(items[0]).to.have.value("fibonacci.h");
      expect(items[1]).to.have.value("*.out");
    });

    // 3. Compile
    cy.get("@stageNodes").eq(2).should("have.attr", "data-label", "Compile").click();
    cy.get("#stage-label").should("have.value", "all");
    cy.get("#input .rti--tag")
      .contains(/^\*\.cpp/)
      .should("exist");
    cy.get("#output").should("have.value", "a.out");
    cy.get("#flags").should("have.value", "");
    cy.get("#additional_packages").should("have.value", "");

    // 4. Standard I/O Test
    cy.get("@stageNodes").eq(3).should("have.attr", "data-label", "Standard I/O Test").click();
    cy.get("#stage-label").should("have.value", "");
    cy.get("button").contains("Edit Stage Configuration").click();

    cy.get('button[title="Edit test case #1"]').click();
    cy.get("#score").should("have.value", "1.0");
    cy.get("#args").should("have.value", "1");
    cy.get('button[title="Next test case"]').click();
    cy.get("#score").should("have.value", "2.0");
    cy.get("#args").should("have.value", "5");

    cy.get("button").contains("Overall Settings").click();
    cy.get("#diff_ignore_flags").should("have.text", "Trailing whitespace");
    cy.get("#additional_packages").should("have.value", "");
    cy.get("#additional_pip_packages .rti--input").should("be.disabled");

    cy.get("button").contains("Save & Close").click();

    // 5. Score
    cy.get("@stageNodes").eq(4).should("have.attr", "data-label", "Score").click();
    cy.get("#stage-label").should("have.value", "");
    cy.get("#normalizedTo").should("have.value", "100");
    cy.get("#minScore").should("have.value", "");
    cy.get("#maxScore").should("have.value", "");
  });

  describe("Next step", () => {
    it("shows an error notification if pipeline is invalid", () => {
      cy.addMockHandlers("cppConfig");
      cy.visit("/assignments/1/configs/1/gui?step=pipeline");

      // Test when config YAML fails validation
      cy.intercept("/api/configs/1/validate", { id: "1", configError: JSON.stringify({ error: "dummy error" }) });
      cy.get('button[data-cy="next-step"]').click();

      cy.get("p").contains("Error in Pipeline Settings").should("be.visible");
      cy.url().should("include", "step=pipeline");

      // Test invalid pipeline layout (disconnected nodes)
      cy.get('button[data-cy="delete-stage-edge"]').first().click();
      cy.get('button[data-cy="next-step"]').click();

      cy.get("p").contains("Invalid Pipeline Layout").should("be.visible");
      cy.url().should("include", "step=pipeline");
    });

    it("saves the config YAML if it passes validation", () => {
      cy.addMockHandlers("cppConfig");
      cy.visit("/assignments/1/configs/1/gui?step=pipeline");

      cy.intercept("/api/configs/1/validate", { id: "1", configError: null });
      cy.intercept("POST", "/v1/graphql", (req) => {
        aliasGqlOperation(req, "updateAssignmentConfig", () => {
          req.reply({
            data: { updateAssignmentConfig: { id: 1 } },
          });
        });
      });

      cy.get('button[data-cy="next-step"]').click();

      cy.wait("@gql_updateAssignmentConfig").its("response.body.data.updateAssignmentConfig.id").should("eq", 1);
      cy.url().should("include", "step=upload"); // Visit next step
    });
  });
});
