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
import { AppealStatus } from "@types";
import Link from "next/link";
import { useState } from "react";
import AppealStatusBadge from "./AppealStatusBadge";

// Temporary type to represent an appeal
// We'll later define an "appeal" type in `types/tables.ts`
type Appeal = {
  id: number;
  updatedAt: string;
  status: AppealStatus;
  name: string;
  sid: string;
  email: string;
  originalScore: number;
  finalScore?: number;
};

// TODO(Bryan): Replace dummy data with real API call
const dummyAppealData: Appeal[] = [
  {
    id: 1,
    updatedAt: "2022-10-30 4:00PM",
    status: AppealStatus.Outstanding,
    name: "LOREM, Ipsum",
    sid: "20609999",
    email: "lorem@connect.ust.hk",
    originalScore: 70,
  },
  {
    id: 2,
    updatedAt: "2022-10-30 5:00PM",
    status: AppealStatus.Completed,
    name: "CHAN, Tai Man Tom",
    sid: "20509999",
    email: "ctm@connect.ust.hk",
    originalScore: 80,
    finalScore: 100,
  },
  {
    id: 3,
    updatedAt: "2022-10-30 3:00PM",
    status: AppealStatus.Rejected,
    name: "CHEUNG, Siu Ming",
    sid: "20409999",
    email: "cmm@connect.ust.hk",
    originalScore: 80,
    finalScore: 80,
  },
];

const columnHelper = createColumnHelper<Appeal>();

/**
 * Columns for the TanStack Table. See https://tanstack.com/table/v8/docs/guide/column-defs
 */
const columns: ColumnDef<Appeal, any>[] = [
  columnHelper.accessor("updatedAt", {
    header: "Last Updated",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (props) => <AppealStatusBadge status={props.getValue()} />,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("sid", {
    header: "SID",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (props) => (
      <a href={`mailto:${props.getValue()}`} className="text-cse-300 underline hover:text-cse-600 transition">
        {props.getValue()}
      </a>
    ),
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
  const [data] = useState(() => [...dummyAppealData]);
  const [sorting, setSorting] = useState<SortingState>([]);

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
