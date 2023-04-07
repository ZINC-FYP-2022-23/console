import { RequestHandler, graphql } from "msw";

/**
 * This config YAML will fail to parse because of duplicated `"compile"` key.
 */
const configYaml = `
_settings:
  lang: 'cpp/g++:8'

compile:
  input: [ "*.cpp" ]
  output: a.out

compile:
  input: [ "*.cpp" ]
  output: a.out
`;

/**
 * Mocks an erroneous assignment config.
 */
export const handlers: RequestHandler[] = [
  graphql.query("getPipelineConfigForAssignment", (_, res, ctx) =>
    res(
      ctx.data({
        assignmentConfig: {
          attemptLimits: null,
          gradeImmediately: true,
          showImmediateScores: true,
          config_yaml: configYaml,
          showAt: "2023-04-01T04:00:00", // April 1, 2023 12:00 PM
          startCollectionAt: "2023-04-01T04:00:00",
          dueAt: "2023-05-01T04:00:00",
          stopCollectionAt: "2023-05-02T04:00:00",
          releaseGradeAt: "2023-05-03T04:00:00",
        },
        assignment: {
          course: {
            id: 1,
          },
        },
      }),
    ),
  ),
];
