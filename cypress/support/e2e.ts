/**
 * @file Custom Cypress commands for end-to-end tests.
 *
 * See `cypress/cypress.d.ts` for the commands' documentation.
 */

import "./commands";

beforeEach(() => {
  cy.login();

  cy.resetMockHandlers();
  // We still add the global handlers here even though we passed them to Mock Server Worker's
  // `setupServer()` or `setupWorker()` because those handlers are not registered successfully for
  // some odd reasons.
  cy.addMockHandlers("global");
});

Cypress.Commands.add("login", () => {
  cy.setCookie("user", "1");
  cy.setCookie("itsc", "~ta");
  cy.setCookie("semester", "2210");
});

Cypress.Commands.add("addMockHandlers", (fileName) => {
  // Set cookie is still necessary here even though the api sets cookies to get it
  // set on the right cypress browser instance.
  cy.setCookie("cypress:mock-file", fileName);

  cy.request({
    method: "GET",
    url: `/api/test-mock/add?file=${encodeURIComponent(fileName)}`,
    failOnStatusCode: true,
  });
});

Cypress.Commands.add("resetMockHandlers", () => {
  cy.clearCookie("cypress:mock-file");

  return cy.request({
    method: "GET",
    url: `/api/test-mock/reset`,
    // Turn off failing on status code for smoke tests that won't have mocks set up
    failOnStatusCode: false,
  });
});
