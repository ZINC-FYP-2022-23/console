/**
 * @file Utilities for converting between raw and tidied configs.
 */

import { valgrindDefaultConfig } from "@/constants/GuiBuilder/supportedStages";
import { TestCase, TestCaseRaw, Valgrind, ValgrindRaw } from "@/types";

/**
 * Splits a string by the `separator` into an array of strings, then removes empty string elements.
 * @param separator Defaults to empty space (`" "`).
 */
export const splitStringToArray = (str?: string, separator = " "): string[] | undefined => {
  return str
    ?.trim()
    .split(separator)
    .filter((arg) => arg !== "");
};

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
    args: splitStringToArray(testCase.args),
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
    args: splitStringToArray(args),
  };
  return output;
};
