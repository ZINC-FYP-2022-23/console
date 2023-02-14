/**
 * @file Utilities for manipulating stage configs.
 */

import { TestCase } from "@/types/GuiBuilder";

/**
 * @returns The largest test case ID in the given test cases.
 */
export const getTestCasesLargestId = (testCases: TestCase[]) => {
  if (testCases.length === 0) return 0; // Since `Math.max(...[])` returns `-Infinity`
  return Math.max(...testCases.map((test) => test.id));
};

/**
 * Returns the neighbors IDs of the given `id` in the form of `[prevId, nextId]`.
 *
 * `prevId` is the ID which is smaller than and closest to `id`. For example, given `[2, 1, 4]`,
 * `prevId` of `4` is `2` because although both `2` and `1` are smaller than `4`, `2` is closer to `4`.
 * The same logic applies to `nextId`.
 *
 * `prevId` and `nextId` can be `null` if the neighbor does not exist.
 *
 * @param id The test case ID to search from.
 * @example
 * // Suppose `testCases` has test cases with IDs [2, 1, 4]
 * getTestCaseNeighborIds(testCases, 1); // returns [null, 2]
 * getTestCaseNeighborIds(testCases, 2); // returns [1, 4]
 * getTestCaseNeighborIds(testCases, 4); // returns [2, null]
 */
export const getTestCaseNeighborIds = (testCases: TestCase[], id: number) => {
  if (!testCases.some((testCase) => testCase.id === id)) {
    console.error(`Test case with ID ${id} not found in test cases.`);
    return [null, null] as const;
  }
  const testCasesSorted = [...testCases].sort((a, b) => a.id - b.id);
  const currentIdx = testCasesSorted.findIndex((testCase) => testCase.id === id);

  const prevId = currentIdx === 0 ? null : testCasesSorted[currentIdx - 1].id;
  const nextId = currentIdx === testCasesSorted.length - 1 ? null : testCasesSorted[currentIdx + 1].id;
  return [prevId, nextId] as const;
};
