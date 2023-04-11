import { RequestHandler, graphql } from "msw";

/**
 * Mocks a new assignment config.
 */
export const handlers: RequestHandler[] = [
  graphql.query("getPipelineConfigForAssignment", (_, res, ctx) =>
    res(
      ctx.data({
        assignmentConfig: null,
        assignment: {
          course: {
            id: 1,
          },
        },
      }),
    ),
  ),
];
