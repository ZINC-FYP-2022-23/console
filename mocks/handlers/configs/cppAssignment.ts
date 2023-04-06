import { RequestHandler, graphql } from "msw";

/**
 * The config YAML of a typical C++ assignment.
 */
const configYamlCpp = `
_settings:
  lang: 'cpp/g++:8'
  use_template: FILENAMES
  template:
    - fibonacci.cpp
  use_skeleton: true
  use_provided: true
  stage_wait_duration_secs: 10
  cpus: 1
  mem_gb: 1
  early_return_on_throw: false
  enable_features:
    network: false

diffWithSkeleton:
  exclude_from_provided: true

fileStructureValidation:
  ignore_in_submission:
    - 'fibonacci.h'
    - '*.out'
  
compile:all:
  input: [ "*.cpp" ]
  output: a.out

stdioTest:
  diff_ignore_flags:
    - TRAILING_WHITESPACE
  testCases:
    - file: a.out
      id: 1
      visibility: ALWAYS_VISIBLE
      score: 1.0
      args: [ "1" ]
      expected: |-
        1
    - file: a.out
      id: 2
      visibility: ALWAYS_VISIBLE
      score: 2.0
      args: [ "5" ]
      expected: |-
        1
        1
        2
        3
        5

score:
  normalizedTo: 100
`;

/**
 * Mocks that `assignmentConfig` table only has one C++ assignment config of ID 1.
 */
export const handlers: RequestHandler[] = [
  graphql.query("getPipelineConfigForAssignment", (req, res, ctx) => {
    const { assignmentConfigId } = req.variables;

    if (assignmentConfigId !== 1) {
      return res(
        ctx.data({
          assignmentConfig: null,
          assignment: {
            course: {
              id: 1,
            },
          },
        }),
      );
    }

    return res(
      ctx.data({
        assignmentConfig: {
          attemptLimits: null,
          gradeImmediately: true,
          showImmediateScores: true,
          config_yaml: configYamlCpp,
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
    );
  }),
];
