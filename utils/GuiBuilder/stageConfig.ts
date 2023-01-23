/**
 * @file Utilities for manipulating stage configs.
 */

import { TestCase } from "@/types";

/**
 * @returns The largest test case ID in the given test cases.
 */
export const getTestCasesLargestId = (testCases: TestCase[]) => {
  if (testCases.length === 0) return 0; // Since `Math.max(...[])` returns `-Infinity`
  return Math.max(...testCases.map((test) => test.id));
};
