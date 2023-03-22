import { GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID, GET_APPEAL_CONFIG } from "@/graphql/queries/appealQueries";
import { AppealStatus, Grade } from "@/types";
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
      const statusSortOrder = [AppealStatus.Pending, AppealStatus.Accept, AppealStatus.Reject] as const;

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
  } = useSubscription(GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID, { variables: { assignmentConfigId: assignmentConfigId } });
  const {
    data: appealConfigData,
    loading: appealConfigLoading,
    error: appealConfigError,
  } = useQuery(GET_APPEAL_CONFIG, { variables: { assignmentConfigId: assignmentConfigId } });

  // TODO(BRYAN): update the score in Student UI as well
  // Transform data into `AppealTableType[]`
  const appealData: AppealTableType[] = [];
  if (appealsDetailsData) {
    appealsDetailsData.appeals.map((appeal) => {
      let status: AppealStatus = transformAppealStatus(appeal.status);

      // Calculate the Original Score
      let originalScore: number = -1;
      for (let i = 0; i < appeal.user.submissions.length; i++) {
        // Do not pick the submission that is related to the appeal
        if (appeal.user.submissions[i].id != appeal.newFileSubmissionId) {
          originalScore = appeal.user.submissions[i].reports[0].grade.score;
          break;
        }
      }

      // Calculate the Final Score
      let finalScore: number | undefined = undefined;
      for (let i = 0; i < appeal.user.change_logs.length; i++) {
        if (appeal.user.change_logs[i].appealId === appeal.id) {
          // Use the latest score change
          if (appeal.user.change_logs[i].type === "SCORE") {
            finalScore = appeal.user.change_logs[i].updatedState.replace(/[^0-9]/g, "");
            break;
          }
          // Use the new file submission score submitted with the appeal
          if (
            status === AppealStatus.Accept &&
            appeal.user.change_logs[i].type === "APPEAL_STATUS" &&
            appeal.user.change_logs[i].updatedState === "[{'status':ACCEPTED}]" &&
            appeal.submission &&
            appeal.submission.reports.length > 0
          ) {
            finalScore = appeal.submission.reports[0].grade.score;
            break;
          }
        }
      }

      appealData.push({
        id: appeal.id,
        updatedAt: format(new Date(appeal.updatedAt ?? appeal.createdAt), "MMM dd, yyyy h:mm aa"),
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
  if (appealDetailsLoading || appealConfigLoading) {
    return <div>Loading...</div>;
  }

  // Display error if it occurred
  if (appealDetailsError) {
    const errorMessage = "Unable to fetch appeals details with `GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (appealConfigError) {
    const errorMessage = "Unable to fetch appeals configs with `GET_APPEAL_CONFIG`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (!appealConfigData.assignmentConfig.isAppealAllowed) {
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
