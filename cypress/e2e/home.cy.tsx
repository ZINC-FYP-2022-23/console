describe("Home page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("should render the page", () => {
    cy.visit("/");
    cy.get("h3").contains("Courses");
  });
});

export {};
