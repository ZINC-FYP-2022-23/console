/**
 * @file Types for sanitized stage reports.
 */

/** Type of each element in {@link DiffReport}. */
export type DiffItemReport = {
  exitCode: number;
  expect: string[];
  hasTimedOut: boolean;
  id: number;
  isCorrect: boolean;
  isSuccess: boolean;
  score: {
    score: number;
    total: number;
  };
  stderr: string[];
  stdout: string[];
  visibility: string;
};

/**
 * Report of the `Diff` stage.
 *
 * This stage is part of the `StdioTest` experimental modularization feature.
 */
export type DiffReport = DiffItemReport[];

/** Type of each element in {@link RunReport}. */
export type RunItemReport = {
  args: string;
  exitCode: number;
  file: string;
  hasTimedOut: boolean;
  id: number;
  isCorrect: boolean;
  isSuccess: boolean;
  stderr: string[];
  stdin: string[];
  stdout: string[];
  visibility: string;
};

/**
 * Report of the `Run` stage.
 *
 * This stage is part of the `StdioTest` experimental modularization feature.
 */
export type RunReport = RunItemReport[];

/** Report of every `StdioTest` test case.  */
export type StdioTestCaseReport = {
  args: string;
  diff: string[];
  diffExitCode: number;
  diffStderr: string[];
  exeExitCode: number;
  exitCode: number;
  expect: string[];
  file: string;
  hasTimedOut: boolean;
  id: number;
  isCorrect: boolean;
  isSuccess: boolean;
  score: {
    score: number;
    total: number;
  };
  stderr: string[];
  stdin: string[];
  stdout: string[];
  visibility: string;
};

/** Report of `StdioTest` without experimental modularization. */
export type StdioTestReport = StdioTestCaseReport[];
