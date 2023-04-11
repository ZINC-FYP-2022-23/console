describe("Home page", () => {
  it("should render the page", () => {
    cy.visit("/");
    cy.get("h3").contains("Courses");
  });
});

export {};
