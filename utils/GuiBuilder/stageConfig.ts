/**
 * @file Utilities for manipulating stage configs (e.g. converting to/from raw configs).
 */

import { valgrindDefaultConfig } from "@constants/GuiBuilder/supportedStages";
import { TestCase, TestCaseRaw, Valgrind, ValgrindRaw } from "@types";

/**
 * Converts a raw test case config obtained from parsing the YAML into a tidied test case config.
 */
export const testCaseFromRaw = (testCaseRaw: TestCaseRaw): TestCase => {
  const { args, valgrind, ...test } = testCaseRaw;
  const output: TestCase = {
    ...test,
    args: args?.join(" "),
    valgrind: valgrind ? valgrindFromRaw(valgrind) : undefined,

    // Helper fields
    _stdinInputMode: (() => {
      if (!test.stdin && !test.file_stdin) return "none";
      return test.stdin ? "text" : "file";
    })(),
    _expectedInputMode: (() => {
      if (!test.expected && !test.file_expected) return "none";
      return test.expected ? "text" : "file";
    })(),
    _valgrindOverride: valgrind !== undefined,
  };
  return output;
};

/**
 * Converts a test case config into a raw test case config to be converted to YAML.
 */
export const testCaseToRaw = (testCase: TestCase): TestCaseRaw => {
  const { _stdinInputMode, _expectedInputMode, _valgrindOverride, ...testRest } = testCase;
  const output: TestCaseRaw = {
    ...testRest,
    args: testCase.args
      ?.trim()
      .split(" ")
      .filter((arg) => arg !== ""),
    stdin: _stdinInputMode === "text" ? testCase.stdin : undefined,
    file_stdin: _stdinInputMode === "file" ? testCase.file_stdin?.trim() : undefined,
    expected: _expectedInputMode === "text" ? testCase.expected : undefined,
    file_expected: _expectedInputMode === "file" ? testCase.file_expected?.trim() : undefined,
    valgrind: _valgrindOverride && testCase.valgrind ? valgrindToRaw(testCase.valgrind) : undefined,
  };
  return output;
};

/**
 * Converts a raw Valgrind config obtained from parsing the YAML into a tidied Valgrind config.
 */
export const valgrindFromRaw = (valgrindRaw: ValgrindRaw): Valgrind => {
  const { enabled, args, checksFilter, visibility, score } = valgrindRaw;
  const output: Valgrind = {
    enabled: enabled ?? valgrindDefaultConfig.enabled,
    args: args?.join(" "),
    checksFilter: checksFilter ?? valgrindDefaultConfig.checksFilter,
    visibility: visibility ?? valgrindDefaultConfig.visibility,
    score,
  };
  return output;
};

/**
 * Converts a Valgrind config into a raw Valgrind config to be converted to YAML.
 */
export const valgrindToRaw = (valgrind: Valgrind): ValgrindRaw => {
  const { args } = valgrind;
  const output: ValgrindRaw = {
    ...valgrind,
    args: args
      ?.trim()
      .split(" ")
      .filter((arg) => arg !== ""),
  };
  return output;
};

/**
 * @returns The largest test case ID in the given test cases.
 */
export const getTestCasesLargestId = (testCases: TestCase[]) => {
  if (testCases.length === 0) return 0; // Since `Math.max(...[])` returns `-Infinity`
  return Math.max(...testCases.map((test) => test.id));
};