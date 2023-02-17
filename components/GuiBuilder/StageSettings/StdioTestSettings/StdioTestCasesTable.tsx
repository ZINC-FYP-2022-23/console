import { useStoreState } from "@/store/GuiBuilder";
import { TestCase, Valgrind, VisibilityTestCase } from "@/types/GuiBuilder";
import { getHeaderColumnSortIcon } from "@/utils/tanstackTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { createContext, useContext, useState } from "react";

interface StdioTestCasesTableProps {
  /** Test cases to show in the table. */
  testCases: TestCase[];
  /** Callback when the user clicks the duplicate button in a test case row. */
  onDuplicate: (testCaseId: number) => void;
  /** Callback when the user clicks the delete button in a test case row. */
  onDelete: (testCaseId: number) => void;
  /** Callback when the user visits a test case by either clicking the row or the visit button. */
  onVisit: (testCaseId: number) => void;
}

//////////////////// Context ////////////////////

type StdioTestCasesTableContextType = Pick<StdioTestCasesTableProps, "onDuplicate" | "onDelete" | "onVisit">;

const StdioTestCasesTableContext = createContext<StdioTestCasesTableContextType | null>(null);
StdioTestCasesTableContext.displayName = "StdioTestCasesTableContext";

function useStdioTestCasesTableContext() {
  const context = useContext(StdioTestCasesTableContext);
  if (context === null) {
    const error = new Error("StdioTestCasesTableContext must be inside a <StdioTestCasesTable /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(error, useStdioTestCasesTableContext);
    throw error;
  }
  return context;
}

//////////////////// Table Definitions ////////////////////

/**
 * Type definition of each row in the Standard I/O test cases table.
 */
type StdioTestCasesTableType = Pick<TestCase, "id" | "score" | "visibility"> & {
  /**
   * Whether this test case will run Valgrind. The logic of computing this value is as follows:
   *  - If the pipeline does not have Valgrind stage, this value is always false.
   *  - If the test case overrides config from Valgrind stage, use the value from the override.
   *  - Otherwise, use the value from the Valgrind stage.
   */
  runValgrind: boolean;
};

const columnHelper = createColumnHelper<StdioTestCasesTableType>();

/**
 * Columns for the Standard I/O test cases table.
 *
 * See {@link https://tanstack.com/table/v8/docs/guide/column-defs TanStack Table Column Definitions}.
 */
const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: (props) => props.getValue() ?? "-",
  }),
  columnHelper.accessor("visibility", {
    header: "Visibility",
    cell: (props) => <VisibilityBadge value={props.getValue()} />,
  }),
  columnHelper.accessor("runValgrind", {
    header: "Run Valgrind",
    cell: (props) => {
      const value = props.getValue();
      return (
        <FontAwesomeIcon
          icon={["far", value ? "circle-check" : "circle-xmark"]}
          className={clsx("text-xl", value ? "text-green-700" : "text-red-700")}
        />
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (props) => <TestCaseRowActions id={props.row.getValue("id")} />,
    enableSorting: false,
  }),
];

const defaultSorting: SortingState = [{ id: "id", desc: false }];

//////////////////// Utilities ////////////////////

/**
 * @param testCases Test cases to map. This array is not mutated.
 * @param valgrind Data of the Valgrind stage if this stage exists in the pipeline.
 */
export const mapTestCasesToTableData = (
  testCases: TestCase[],
  valgrind: Valgrind | null,
): StdioTestCasesTableType[] => {
  return testCases.map(
    (testCase): StdioTestCasesTableType => ({
      id: testCase.id,
      score: testCase.score,
      visibility: testCase.visibility,
      runValgrind: (() => {
        if (!valgrind) return false;
        if (testCase._valgrindOverride && testCase.valgrind) return testCase.valgrind.enabled;
        return valgrind.enabled;
      })(),
    }),
  );
};

//////////////////// Components ////////////////////

/**
 * A table for showing all Standard I/O test cases.
 */
function StdioTestCasesTable({ testCases, onDuplicate, onDelete, onVisit }: StdioTestCasesTableProps) {
  const editingConfig = useStoreState((state) => state.config.editingConfig);

  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const table = useReactTable({
    data: mapTestCasesToTableData(
      testCases,
      (() => {
        const valgrindStage = Object.values(editingConfig.stageData).find((stage) => stage.name === "Valgrind");
        return valgrindStage ? (valgrindStage.config as Valgrind) : null;
      })(),
    ),
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <StdioTestCasesTableContext.Provider value={{ onDuplicate, onDelete, onVisit }}>
      <div className="shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-cool-gray-200">
          <thead className="bg-cool-gray-200 font-medium text-sm text-cool-gray-700">
            {table.getHeaderGroups().map((headerGroup) => {
              const headers = headerGroup.headers;
              return (
                <tr key={headerGroup.id}>
                  {headers.map((header, index) => {
                    const headerName = flexRender(header.column.columnDef.header, header.getContext());
                    const isLast = headers.length - 1 === index;
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <th key={header.id} className={clsx("py-3 font-medium", isLast ? "pr-3" : "px-5")}>
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className={clsx("flex self-center", canSort && "cursor-pointer")}
                        >
                          {headerName && <span>{headerName}</span>}
                          {canSort && (
                            <span className="ml-2 flex self-center w-3 h-3">
                              {getHeaderColumnSortIcon(sortDirection)}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody className="bg-cool-gray-50 text-sm text-cool-gray-600 divide-y divide-cool-gray-200">
            {rows.map((row) => {
              const cells = row.getVisibleCells();
              return (
                <tr
                  key={row.id}
                  onClick={() => onVisit(row.getValue("id"))}
                  className="cursor-pointer transition hover:bg-cool-gray-100"
                >
                  {cells.map((cell, index) => {
                    const isLast = cells.length - 1 === index;
                    return (
                      <td key={cell.id} className={clsx("py-1", isLast ? "pr-3" : "px-5")}>
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
    </StdioTestCasesTableContext.Provider>
  );
}

const visibilityBadgeData: Record<
  VisibilityTestCase,
  {
    /** Label to show in the badge. */
    label: string;
    /** Classes for the background and text colors. */
    color: string;
  }
> = {
  ALWAYS_VISIBLE: {
    label: "Always Visible",
    color: "bg-green-100 text-green-800",
  },
  ALWAYS_HIDDEN: {
    label: "Always Hidden",
    color: "bg-gray-200 text-gray-600",
  },
  VISIBLE_AFTER_GRADING: {
    label: "Visible After Grading",
    color: "bg-blue-100 text-blue-800",
  },
  VISIBLE_AFTER_GRADING_IF_FAILED: {
    label: "Visible After Grading If Failed",
    color: "bg-pink-100 text-pink-800",
  },
};

/**
 * A badge showing the visibility of a test case.
 */
function VisibilityBadge({ value }: { value: VisibilityTestCase }) {
  const { label, color } = visibilityBadgeData[value];
  return <p className={clsx("max-w-fit px-3 py-0.5 font-medium rounded-full", color)}>{label}</p>;
}

/**
 * Action buttons for a test case row.
 */
function TestCaseRowActions({ id }: { id: number }) {
  const { onDuplicate, onDelete, onVisit } = useStdioTestCasesTableContext();

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-6">
        <button
          onClick={(event) => {
            onDuplicate(id);
            event.stopPropagation();
          }}
          title={`Duplicate test case #${id}`}
          className="w-9 h-9 flex items-center justify-center text-cool-gray-500 text-xl rounded-full transition hover:text-green-600 hover:bg-green-100"
        >
          <FontAwesomeIcon icon={["far", "copy"]} />
        </button>
        <button
          onClick={(event) => {
            onDelete(id);
            event.stopPropagation();
          }}
          title={`Delete test case #${id}`}
          className="w-9 h-9 flex items-center justify-center text-cool-gray-500 text-xl rounded-full transition hover:text-red-600 hover:bg-red-100"
        >
          <FontAwesomeIcon icon={["far", "trash-can"]} />
        </button>
      </div>
      <button
        onClick={(event) => {
          onVisit(id);
          event.stopPropagation();
        }}
        title={`Edit test case #${id}`}
        className="w-9 h-9 ml-10 flex items-center justify-center text-cool-gray-700 text-xl rounded-full transition hover:bg-cool-gray-200"
      >
        <FontAwesomeIcon icon={["fas", "arrow-right"]} />
      </button>
    </div>
  );
}

export default StdioTestCasesTable;
