/**
 * @file Custom Cypress commands that are useful in both E2E and component tests.
 *
 * See `cypress/cypress.d.ts` for the commands' documentation.
 */

import "@4tw/cypress-drag-drop";

Cypress.Commands.add("clickMultiSelectInput", (selector: string, content: string[]) => {
  cy.get(selector).click();
  content.forEach((c) => {
    cy.get("li").contains(c).click();
  });
  cy.get(selector).click(); // Closes the dropdown
});

Cypress.Commands.add("clickOutside", () => {
  return cy.get("body").click(0, 0);
});

Cypress.Commands.add("clickSelectInput", (selector: string, content: string) => {
  cy.get(selector).click();
  cy.get("div.mantine-Select-item").contains(content).click();
});

export {};
