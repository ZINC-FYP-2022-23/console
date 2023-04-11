describe("GuiBuilder: Page-wide error handling", () => {
  it("shows an error message if fails to parse the config YAML", () => {
    cy.addMockHandlers("erroneousConfig");
    cy.visit("/assignments/1/configs/1/gui");

    cy.get("h1").contains("Something went wrong").should("be.visible");
    cy.get("a").contains("Edit in YAML Editor Mode").click();
    cy.url().should("include", "/assignments/1/configs/1/yaml");
  });

  it("shows 404 page if the config does not exist", () => {
    cy.addMockHandlers("cppConfig");

    // The mock handler only returns a config if the ID is 1.
    cy.request({ url: "/assignments/1/configs/2/gui", failOnStatusCode: false }).its("status").should("eq", 404);

    // Test invalid config ID
    cy.request({ url: "/assignments/1/configs/foo/gui", failOnStatusCode: false }).its("status").should("eq", 404);
  });
});
