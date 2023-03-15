/**
 * @file Common scorable policy options for use in `ScorablePolicyRadioGroup`.
 */

import { ScorablePolicyRadioGroupOption } from "./ScorablePolicyRadioGroup";

/**
 * Usually adopted by test-cases-based grading stages that outputs XUnit XML format reports
 * (e.g. {@link https://docs.zinc.ust.dev/user/pipeline/docker/PyTest.html PyTest}).
 */
export const testCaseScorablePolicyOptions: ScorablePolicyRadioGroupOption<"total" | "weighted" | "disable">[] = [
  {
    value: "total",
    label: "Score-out-of-Total",
    description: "Compute score from percentage of test cases passed. Each test case contributes the same score.",
  },
  {
    value: "weighted",
    label: "Weighted",
    description: "Some test cases can contribute more marks to this stage's total score.",
  },
  {
    value: "disable",
    label: "Disable",
    description: "This stage will not contribute to the final score of the submission.",
  },
];
