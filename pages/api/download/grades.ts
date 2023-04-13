import type { NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
import axios from "axios";
import { Workbook } from "exceljs";
import { utcToZonedTime } from "date-fns-tz";
import { GET_GRADEBOOK_DATA } from "@/graphql/queries/appealQueries";

// Helper function to determine final score from appeals and manual TA changes
export const finalScore = (submission, report, assignment_appeals: any[], changeLogs: any[]) => {
  const computeScoreFromReport = (r) => {
    return r.grade !== null && r.grade.hasOwnProperty("details")
      ? r.grade.details.accScore
      : r.grade === null
      ? "N/A"
      : `${r.grade.score}`;
  };

  let date: Date = utcToZonedTime(submission.created_at, "Asia/Hong_Kong");
  let fScore: string = computeScoreFromReport(report);

  // Check for assignment appeals
  if (assignment_appeals.length > 0) {
    const [appeal] = assignment_appeals;
    if (appeal && appeal.submission && appeal.submission.reports && appeal.submission.reports.length > 0) {
      // TODO(Owen): appeal.updatedAt type `string | null` not allowed
      date = utcToZonedTime(appeal.updatedAt, "Asia/Hong_Kong");
      fScore = computeScoreFromReport(appeal.submission.reports[0]);
    }
  }

  // Check for TA manual change logs
  if (changeLogs.length > 0) {
    const [change] = changeLogs;
    if (change && utcToZonedTime(change.createdAt, "Asia/Hong_Kong").getTime() > date.getTime()) {
      date = utcToZonedTime(change.createdAt, "Asia/Hong_Kong");
      fScore = `${change.updatedState.score}`;
    }
  }

  return fScore;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { assignmentConfigId, viewingTaskAssignedGroups } = req.query;

    // Obtain submissions for given assignment config
    const {
      data: { data },
    } = await axios({
      method: "post",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      /**
       * The following query extracts, from an input assignmentConfigId:
       * - Submissions
       *   - Returns the latest non appeal-related submission for each student
       * - Appeals
       *   - Returns the latest ACCEPTED appeal along with submission details for each student
       * - Change logs
       *   - Returns the latest SCORE change for each student
       */
      data: {
        query: GET_GRADEBOOK_DATA.loc?.source.body,
        variables: { id: assignmentConfigId },
      },
    });
    const { assignment, submissions, dueAt, assignmentAppeals } = data.assignmentConfig;
    const changeLogs = data.changeLogs;

    // Create new Excel workbook
    const workbook = new Workbook();
    workbook.creator = "Zinc by HKUST CSE Department";
    workbook.created = new Date();

    // Create new spreadsheet on workbook
    const sheet = workbook.addWorksheet(`grades ${viewingTaskAssignedGroups ?? ""}`);
    const defaultColumns = [
      { header: "ITSC", key: "itsc", width: 16 },
      { header: "Name", key: "name", width: 32 },
      { header: "Score", key: "score", width: 16 },
      { header: "Late Submission", key: "late", width: 16 },
      { header: "Final Score", key: "final_score", width: 16 },
    ];
    // @ts-ignore
    sheet.columns = defaultColumns;

    // Convert each submission into a row in Excel gradebook
    for (const submission of submissions) {
      const { name, itsc } = submission.user;

      // Compute late field
      const dueDate = new Date(dueAt);
      const submittedDate = new Date(submission.created_at);
      if (submission.reports.length > 0) {
        const [report] = submission.reports;
        if (report.grade !== null && report.grade.hasOwnProperty("details")) {
          let subgradeColumns: any = [];
          for (const subGradeReport of report.grade.details.reports) {
            if (sheet.columns.map((column) => column.key).indexOf(subGradeReport["stageReportPath"]) === -1) {
              subgradeColumns.push({ header: subGradeReport["displayName"], key: subGradeReport["hash"], width: 32 });
            }
          }
          // @ts-ignore
          sheet.columns = [...defaultColumns, ...subgradeColumns];
          const subgradeReports = report.grade.details.reports.reduce((a, c) => {
            a[c.hash] = c.score;
            return a;
          }, {});
          sheet.addRow({
            itsc,
            name,
            score: report.grade.details.accScore,
            late: submission.isLate
              ? `${((submittedDate.getTime() - dueDate.getTime()) / 1000 / 60).toFixed(2)} mins`
              : "",
            final_score: finalScore(
              submission,
              report,
              assignmentAppeals.filter((e) => e.user.itsc === itsc),
              changeLogs.filter((e) => e?.user.itsc === itsc),
            ),
            ...subgradeReports,
          });
        } else {
          sheet.addRow({
            itsc,
            name,
            score: report.grade === null ? "N/A" : `${report.grade.score}`,
            late: submission.isLate
              ? `${((submittedDate.getTime() - dueDate.getTime()) / 1000 / 60).toFixed(2)} mins`
              : "",
            final_score: finalScore(
              submission,
              report,
              assignmentAppeals.filter((e) => e.user.itsc === itsc),
              changeLogs.filter((e) => e?.user.itsc === itsc),
            ),
          });
        }
      } else {
        sheet.addRow({
          itsc,
          name,
          score: "N/A",
          final_score: "N/A",
        });
      }
    }

    // Return gradebook file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    await workbook.xlsx.write(res);
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
}

export default withSentry(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
