describe("GuiBuilder: General Settings step", () => {
  it("populates input fields from an existing C++ config", () => {
    cy.addMockHandlers("cppAssignment");
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
});
