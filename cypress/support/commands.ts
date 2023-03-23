/**
 * @file Custom Cypress commands that are useful in both E2E and component tests.
 */

Cypress.Commands.add("clickOutside", () => {
  return cy.get("body").click(0, 0);
});

export {};
