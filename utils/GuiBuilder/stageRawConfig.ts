/**
 * @file Utilities for converting between raw and tidied configs.
 */

import { defaultValgrindConfig } from "@/constants/GuiBuilder/defaults";
import {
  OverrideRaw,
  ScoreWeighting,
  ScoreWeightingRaw,
  TestCase,
  TestCaseRaw,
  Valgrind,
  ValgrindRaw,
} from "@/types/GuiBuilder";
import { v4 as uuidv4 } from "uuid";

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
 * Converts a raw score weighting object obtained from parsing the YAML into a tidied score weighting object.
 */
export const scoreWeightingFromRaw = <
  TOverrideRaw extends OverrideRaw,
  TOverride extends TOverrideRaw & { _uuid: string },
>(
  scRaw: ScoreWeightingRaw<TOverrideRaw>,
): ScoreWeighting<TOverride> => {
  const overrides = scRaw.overrides?.map((override) => ({ ...override, _uuid: uuidv4() })) ?? [];
  return {
    ...scRaw,
    overrides: overrides as TOverride[],
  };
};

/**
 * Converts a score weighting object into a raw score weighting object to be converted to YAML.
 */
export const scoreWeightingToRaw = <
  TOverrideRaw extends OverrideRaw,
  TOverride extends TOverrideRaw & { _uuid: string },
>(
  sc: ScoreWeighting<TOverride>,
): ScoreWeightingRaw<TOverrideRaw> => {
  const overrides = sc.overrides.map((override) => {
    const { _uuid, ...overrideRest } = override;
    // TypeScript complains if we directly write `overrideRest as TOverrideRaw` because it's not smart enough
    // to understand that `Omit<TOverride, "_uuid">` is equal to `TOverrideRaw`. Hence, we cast `overrideRest`
    // as `unknown` first before casting it to `TOverrideRaw`.
    return overrideRest as unknown as TOverrideRaw;
  });
  return { ...sc, overrides };
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
    _valgrindOverride: !!valgrind,
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
    enabled: enabled ?? defaultValgrindConfig.enabled,
    args: args?.join(" "),
    checksFilter: checksFilter ?? defaultValgrindConfig.checksFilter,
    visibility: visibility ?? defaultValgrindConfig.visibility,
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
