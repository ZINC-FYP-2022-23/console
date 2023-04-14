/**
 * @file Utilities for transforming stage reports.
 */

import { DiffReport, RunReport, StdioTestReport } from "@/types/stageReports";

/**
 * Combines reports from the `Run` and `Diff` stages into a `StdioTest` stage report.
 *
 * If the `experimentalModularize` flag is on in `StdioTest`'s configuration, this stage will be modularized into
 * multiple `Run` and `Diff` stages. However, the Grader currently outputs stage reports for `Run` and `Diff` stages
 * instead of a single `StdioTest` stage report. Hence, this function intends to merge the `Run` and `Diff` stage reports
 * into a single `StdioTest` stage report.
 *
 * The Grader is still investigating how to merge `Run` and `Diff` reports into a single `StdioTest` report. Once the Grader
 * has implemented the stage report merging, this function is no longer necessary.
 *
 * @param runReport Report of the `Run` stage.
 * @param diffReport Report of the `Diff` stage.
 * @returns Report of a `StdioTest` stage, as if the `experimentalModularize` flag is off.
 */
export function transformModularizedStdioTestReports(runReport: RunReport, diffReport: DiffReport): StdioTestReport {
  const output: StdioTestReport = [];

  for (let i = 0; i < runReport.length; i++) {
    const runReportItem = runReport[i];
    const diffReportItem = diffReport[i];

    output.push({
      args: runReportItem.args,
      diff: diffReportItem.stdout,
      diffExitCode: diffReportItem.exitCode,
      diffStderr: diffReportItem.stderr,
      exeExitCode: runReportItem.exitCode,
      exitCode: [diffReportItem.exitCode, runReportItem.exitCode].find((code) => code !== 0) ?? 0,
      expect: diffReportItem.expect,
      file: runReportItem.file,
      hasTimedOut: runReportItem.hasTimedOut || diffReportItem.hasTimedOut,
      id: runReportItem.id,
      isCorrect: runReportItem.isCorrect && diffReportItem.isCorrect,
      isSuccess: runReportItem.isSuccess && diffReportItem.isSuccess,
      score: diffReportItem.score,
      stderr: runReportItem.stderr,
      stdin: runReportItem.stdin,
      stdout: runReportItem.stdout,
      visibility: runReportItem.visibility,
    });
  }

  return output;
}
