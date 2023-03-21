/**
 * @file Utilities related to stage configs.
 */

import { cFamilyCompileDefault } from "@/constants/GuiBuilder/supportedLanguages";
import { Compile, SettingsLang, TestCase } from "@/types/GuiBuilder";

/**
 * Previews what the compilation command will the {@link Compile} stage run. It returns `null` if
 * preview is not available.
 *
 * The previewed command is derived from how the Grader would build the command in the implementation
 * of the `Compile` stage.
 *
 * @param lang Language of the config.
 * @param compile The `Compile` stage config.
 */
export const getCompilePreviewCommand = (lang: SettingsLang, compile: Compile): string | null => {
  const input = compile.input.join(" ");

  switch (lang.language) {
    case "c":
    case "cpp": {
      let compiler = lang.compiler;
      if (compiler === "clang") {
        if (lang.language === "cpp") compiler += "++";
        compiler += `-${lang.version}`;
      }
      const flags = compile.flags || cFamilyCompileDefault.flags;
      const output = compile.output || cFamilyCompileDefault.output;

      return `${compiler} ${flags} -o ${output} ${input}`;
    }
    default:
      return null;
  }
};

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
