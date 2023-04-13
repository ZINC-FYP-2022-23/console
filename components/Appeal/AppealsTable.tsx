import {
  GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID,
  GET_APPEAL_CONFIG,
  GET_SUBMISSIONS_BY_ASSIGNMENT_ID,
} from "@/graphql/queries/appealQueries";
import { AppealStatus, AssignmentConfig, Appeal, Submission as SubmissionType } from "@/types";
import { ChangeLog } from "@/types/tables";
import { useQuery, useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert } from "@mantine/core";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortDirection,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import AppealStatusBadge from "./AppealStatusBadge";
import { transformAppealStatus } from "@/utils/appealUtils";
import { utcToZonedTime } from "date-fns-tz";

/** Type definition of each row in the Appeals Table. */
type AppealTableType = {
  id: number;
  updatedAt: string;
  status: AppealStatus;
  name: string;
  itsc: string;
  originalScore: number;
  finalScore?: number;
};

const columnHelper = createColumnHelper<AppealTableType>();

/**
 * Columns for the TanStack Table. See https://tanstack.com/table/v8/docs/guide/column-defs
 */
const columns: ColumnDef<AppealTableType, any>[] = [
  columnHelper.accessor("updatedAt", {
    header: "Last Updated",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (props) => <AppealStatusBadge status={props.getValue()} />,
    sortingFn: (rowA, rowB, columnId) => {
      /** Sort status according to their orders of appearence in this array */
      const statusSortOrder = [AppealStatus.PENDING, AppealStatus.ACCEPTED, AppealStatus.REJECTED] as const;

      const rowAStatus: AppealStatus = rowA.getValue(columnId);
      const rowBStatus: AppealStatus = rowB.getValue(columnId);
      return statusSortOrder.indexOf(rowAStatus) - statusSortOrder.indexOf(rowBStatus);
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("itsc", {
    header: "ITSC",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("originalScore", {
    header: "Original Score",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("finalScore", {
    header: "Final Score",
    cell: (props) => props.getValue() ?? "-",
  }),
  columnHelper.accessor("id", {
    header: "",
    cell: (props) => (
      <Link href={`/appeals/${props.getValue()}`} passHref>
        <a className="p-2 text-cool-gray-500 text-lg rounded-full hover:bg-cool-gray-100">
          <FontAwesomeIcon icon={["fas", "arrow-right"]} />
        </a>
      </Link>
    ),
    enableSorting: false,
  }),
];

const defaultSorting: SortingState = [
  { id: "status", desc: false }, // Appeal status
];

/**
 * @param sort Sort direction. `false` means restore original order.
 * @returns The sort icon to display in the header.
 */
const getSortIcon = (sort: SortDirection | false) => {
  switch (sort) {
    case "asc":
      return <FontAwesomeIcon icon={["fas", "sort-up"]} />;
    case "desc":
      return <FontAwesomeIcon icon={["fas", "sort-down"]} />;
    default:
      return null;
  }
};

interface DisplayErrorProps {
  /** Message shown to the user when encountering an error */
  errorMessage: string;
}

/**
 * Returns an error page
 */
function DisplayError({ errorMessage }: DisplayErrorProps) {
  return (
    <div className="my-6 mt-8 flex flex-col items-center self-center mb-4">
      <Alert icon={<FontAwesomeIcon icon={["far", "circle-exclamation"]} />} title="Error" color="red" variant="filled">
        {errorMessage}
      </Alert>
    </div>
  );
}

interface getScoreProps {
  appeals: Appeal[];
  changeLogs: ChangeLog[];
  submissions: SubmissionType[];
}

/**
 * Gets the latest score based on the following logic:
 * @returns {number}
 */
function getScore({ appeals, changeLogs, submissions }: getScoreProps): number | undefined {
  /* *** Logic of how to get the score: ***
   * If the `updatedAt` of the latest `ACCEPTED` appeal later than the date of any `SCORE` change:
   *    If `newFileSubmission` is available, >>>  use the score of the `newFileSubmission`.
   *    If `newFileSubmission` is NOT available:
   *        If there is a `SCORE` change log >>> use the score of latest `SCORE` change.
   *        If there is NO `SCORE` change log >>> use the score of the original submission.
   * If there is the date of the latest `SCORE` change than is later than the `updatedAt` of the latest `ACCEPTED` appeal >>> use the score of latest `SCORE` change
   * If there are NO `SCORE` change log AND `ACCEPTED` appeal >>> use the score of the original submission
   */

  const acceptedAppeals: Appeal[] = appeals.filter((e) => e.status === "ACCEPTED");
  let acceptedAppealDate: Date | null = null;
  let acceptedAppealScore: number | undefined = undefined;

  // Get the latest `ACCEPTED` appeal with a new score generated
  for (let i = 0; i < acceptedAppeals.length; i++) {
    if (
      acceptedAppeals[i].updatedAt &&
      acceptedAppeals[i].submission &&
      acceptedAppeals[i].submission.reports.length > 0
    ) {
      acceptedAppealDate = new Date(acceptedAppeals[i].updatedAt!);
      acceptedAppealScore = acceptedAppeals[i].submission.reports[0].grade.score;
      break;
    }
  }

  // Get the latest `SCORE` change log
  for (let i = 0; i < changeLogs.length; i++) {
    const changeLogDate: Date = new Date(changeLogs[i].createdAt);

    if (acceptedAppealDate && acceptedAppealDate > changeLogDate) {
      return acceptedAppealScore;
    }

    if (changeLogs[i].type === "SCORE") {
      return changeLogs[i].updatedState["score"];
    }
  }

  // If above fails, get the original submission score
  return submissions.filter((e) => !e.isAppeal && e.reports.length > 0)[0].reports[0].grade.score;
}

interface AppealsTableProps {
  assignmentConfigId: number;
}

/** Table that summarizes all grade appeals. */
function AppealsTable({ assignmentConfigId }: AppealsTableProps) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  // Fetch data with GraphQL
  const {
    data: appealsDetailsData,
    loading: appealDetailsLoading,
    error: appealDetailsError,
  } = useSubscription<{ appeals: Appeal[] }>(GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID, {
    variables: { assignmentConfigId: assignmentConfigId },
  });
  const {
    data: appealConfigData,
    loading: appealConfigLoading,
    error: appealConfigError,
  } = useQuery<{ assignmentConfig: AssignmentConfig }>(GET_APPEAL_CONFIG, {
    variables: { assignmentConfigId: assignmentConfigId },
  });
  const {
    data: submissionsData,
    loading: submissionsLoading,
    error: submissionsError,
  } = useSubscription<{ submissions: SubmissionType[] }>(GET_SUBMISSIONS_BY_ASSIGNMENT_ID, {
    variables: { assignmentConfigId: assignmentConfigId },
  });

  // Transform data into `AppealTableType[]`
  const appealData: AppealTableType[] = [];
  if (appealsDetailsData && submissionsData) {
    appealsDetailsData.appeals.map((appeal, appealIndex) => {
      let status: AppealStatus = transformAppealStatus(appeal.status);

      // Get the Original Score
      const originalScore: number = submissionsData!.submissions.filter((e) => !e.isAppeal && e.reports.length > 0)[0]
        .reports[0].grade.score;

      // Get the Final Score
      const userAppeals: Appeal[] = appealsDetailsData.appeals
        .filter((a) => a.userId === appeal.userId)
        .slice(appealIndex);
      const userChangeLogs: ChangeLog[] = appeal.user.changeLogsByUserId.filter((c) => c.appealId === appeal.id);
      const userSubmissions: SubmissionType[] = submissionsData.submissions.filter((s) => s.user_id === appeal.userId);
      const finalScore = getScore({
        appeals: userAppeals,
        changeLogs: userChangeLogs,
        submissions: userSubmissions,
      });

      appealData.push({
        id: appeal.id,
        updatedAt: format(
          utcToZonedTime(`${appeal.updatedAt ?? appeal.createdAt}Z`, "Asia/Hong_Kong"),
          "MMM dd, yyyy h:mm aa",
        ),
        status,
        name: appeal.user.name,
        itsc: appeal.user.itsc,
        originalScore,
        finalScore,
      });
    });
  }

  const table = useReactTable({
    data: appealData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Display `Loading` if data is still being fetched
  if (appealDetailsLoading || appealConfigLoading || submissionsLoading) {
    return <div>Loading...</div>;
  }

  // Display error if it occurred
  if (appealDetailsError) {
    const errorMessage = "Unable to fetch appeals details with `GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (appealConfigError) {
    const errorMessage = "Unable to fetch appeals configs with `GET_APPEAL_CONFIG`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (!appealConfigData!.assignmentConfig.isAppealAllowed) {
    // Check if the appeal submission is allowed
    const errorMessage = "`isAppealAllowed` has been set to false";
    return <DisplayError errorMessage={errorMessage} />;
  }

  return (
    <div className="shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-cool-gray-200">
        <thead className="bg-cool-gray-100 text-xs leading-4 text-cool-gray-500 uppercase tracking-wider">
          {table.getHeaderGroups().map((headerGroup) => {
            const headers = headerGroup.headers;
            return (
              <tr key={headerGroup.id}>
                {headers.map((header, index) => {
                  const headerName = flexRender(header.column.columnDef.header, header.getContext());
                  const isLastHeader = headers.length - 1 === index;
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th key={header.id} className={`${isLastHeader ? "pr-3" : "px-5"} py-3 font-medium text-left`}>
                      <div
                        className={`flex self-center ${header.column.getCanSort() ? "cursor-pointer" : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>{headerName}</span>
                        <span className="ml-2 flex self-center w-3 h-3">{getSortIcon(sortDirection)}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody className="bg-white text-sm text-cool-gray-700 divide-y divide-cool-gray-200">
          {table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            return (
              <tr key={row.id}>
                {cells.map((cell, index) => {
                  const isLastCell = cells.length - 1 === index;
                  return (
                    <td key={cell.id} className={`${isLastCell ? "pr-3" : "px-5"} py-3`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AppealsTable;
