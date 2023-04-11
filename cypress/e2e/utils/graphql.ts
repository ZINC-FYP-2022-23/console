import { CyHttpMessages } from "cypress/types/net-stubbing";

/**
 * Whether the GraphQL API call has the operation name `operationName`.
 * @param operationName The name of the operation to match. Same as `operationName` field in the GraphQL
 * request body.
 */
export const hasGqlOperationName = (req: CyHttpMessages.IncomingHttpRequest, operationName: string): boolean => {
  const { body } = req;
  return body.hasOwnProperty("operationName") && body.operationName === operationName;
};

/**
 * Aliases a GraphQL operation of name `name` with the alias `gql_${name}` if the GraphQL API call
 * has that operation.
 * @param callback Callback function to run if the GraphQL API call has the operation name. Useful for
 * mocking the response with `req.reply()`.
 * @example
 * cy.intercept("POST", "/v1/graphql", (req) => {
 *   // Mock the response of the "createAssignment" GraphQL operation
 *   aliasGqlOperation(req, "createAssignment", () => {
 *     req.reply({
 *       data: { createAssignment: { id: 1 } },
 *     });
 *   });
 * });
 *
 * // Assert that the "createAssignment" GraphQL operation was called
 * cy.wait("@gql_createAssignment")
 *   .its("response.body.data.createAssignment.id")
 *   .should("eq", 1);
 */
export const aliasGqlOperation = (req: CyHttpMessages.IncomingHttpRequest, name: string, callback?: () => void) => {
  if (hasGqlOperationName(req, name)) {
    req.alias = `gql_${name}`;
    if (callback) {
      callback();
    }
  }
};
