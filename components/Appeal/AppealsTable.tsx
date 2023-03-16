import { AppealAttempt, AppealStatus, Grade, User } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { dummyAppealAttemptData, dummyUserData, dummyOldGradeData, dummyNewGradeData } from "@/utils/dummyData";

// TODO(Bryan): Replace dummy data with real API call

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

interface TransformAppealDataType {
  appealData: AppealAttempt[]; // List of appeals submitted by students
  userData: User[]; // List of data of the student
  oldGrade: Grade[]; // List of grades before the appeal is submitted
  newGrade: Grade[]; // List of grades after the appeal is processed
}

/**
 * Transform Appeal Data to `TransformAppealDataType` for displaying in the appeals table
 * @returns {AppealTableType[]}
 */
// TODO(BRYAN): Add `oldGrade`, `newGrade`
function transformAppealData({ appealData, userData }: TransformAppealDataType): AppealTableType[] {
  return appealData.map((data, index) => {
    const updatedDateString = data.updatedAt ?? data.createdAt;
    const updatedDateDate = new Date(updatedDateString);
    const updatedDateFinalString = format(updatedDateDate, "MMM dd, yyyy h:mm aa");

    return {
      id: data.id,
      updatedAt: updatedDateFinalString,
      status: data.latestStatus,
      name: userData[index].name,
      itsc: userData[index].itsc,
      originalScore: 70,
      finalScore: 100,
      //originalScore: oldGrade[index].score,
      //finalScore: newGrade[index].score,
    };
  });
}

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

/** Table that summarizes all grade appeals. */
function AppealsTable() {
  const appealData: AppealTableType[] = transformAppealData({
    appealData: dummyAppealAttemptData,
    userData: dummyUserData,
    oldGrade: dummyOldGradeData,
    newGrade: dummyNewGradeData,
  });

  const [data] = useState(appealData);
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
