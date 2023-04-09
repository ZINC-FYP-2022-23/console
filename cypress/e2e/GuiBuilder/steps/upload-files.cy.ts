const helpersApiUrl = "/api/configs/1/helpers";

describe("GuiBuilder: Upload Files step", () => {
  beforeEach(() => {
    cy.intercept("GET", helpersApiUrl, {
      result: [
        {
          name: "provided",
          files: [
            { path: "/grader/fsdata/helpers/1/provided/main.cpp", type: "file" },
            { path: "/grader/fsdata/helpers/1/provided/fibonacci.h", type: "file" },
          ],
        },
        {
          name: "skeleton",
          files: [
            { path: "/grader/fsdata/helpers/1/provided/fibonacci.cpp", type: "file" },
            { path: "/grader/fsdata/helpers/1/provided/fibonacci.h", type: "file" },
          ],
        },
        {
          name: "template",
          files: [],
        },
      ],
    });
  });

  it("renders the upload files component", () => {
    cy.addMockHandlers("cppConfig");
    cy.intercept("POST", helpersApiUrl, {}).as("uploadHelpers");

    cy.visit("/assignments/1/configs/1/gui?step=upload");

    cy.get('[data-cy="provided"] [data-cy="file"]').should("have.length", 2);
    cy.get('[data-cy="skeleton"] [data-cy="file"]').should("have.length", 2);
    cy.get('[data-cy="template"] [data-cy="file"]').should("have.length", 0);

    // Test the Save button
    cy.get("button").contains("Save").click();
    cy.wait("@uploadHelpers").its("response.statusCode").should("eq", 200);
  });

  describe("Next step", () => {
    it("moves to Test Submission step", () => {
      cy.addMockHandlers("cppConfig");
      cy.visit("/assignments/1/configs/1/gui?step=upload");

      cy.get('button[data-cy="next-step"]').click();
      cy.url().should("include", "step=test");
    });
  });
});
