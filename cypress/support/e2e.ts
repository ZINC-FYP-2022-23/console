/**
 * @file Custom Cypress commands for end-to-end tests.
 *
 * See `cypress/cypress.d.ts` for the commands' documentation.
 */

import "./commands";

Cypress.Commands.add("login", () => {
  cy.setCookie("user", "1");
  cy.setCookie("itsc", "~ta");
  cy.setCookie("semester", "2210");
});
