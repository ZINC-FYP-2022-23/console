import { RunReport } from "@/types/stageReports";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, Modal } from "@mantine/core";
import { useState } from "react";

interface RunStageReportProps {
  reports: RunReport;
}

/**
 * Report of a `Run` stage.
 *
 * A stage report has a `Run` stage report if `StdioTest`'s experimental modularization feature is enabled.
 * This may not be true in the future as the Grader is investigating report transformations so that the `Run`
 * stage will not be reported.
 */
export function RunStageReportView({ reports }: RunStageReportProps) {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [viewingMode, setViewingMode] = useState<"stdout" | "stderr">("stdout");

  const selectedReport = reports.find((report) => report.id === selectedReportId);

  return (
    <div className="bg-white shadow rounded-lg border">
      <header className="bg-gray-100 w-full px-4 py-3 rounded-tl-lg rounded-tr-lg border-b flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium leading-5">
            Run
            <RunStatus allCorrect={reports.every((report) => report.isCorrect)} />
          </h3>
          <h6 className="text-xs text-gray-600">Runs an executable with standard input/output</h6>
        </div>
        <span className="bg-indigo-500 w-10 h-10 rounded-full flex justify-center items-center shadow">
          <FontAwesomeIcon className="text-white" icon={["fad", "terminal"]} />
        </span>
      </header>
      <div className="px-4 py-3 flex flex-col justify-between">
        <div className="mb-4">
          <nav className="flex items-center">
            <button className="px-3 py-1 font-medium text-xs tracking-wider uppercase leading-5 rounded-md text-gray-700 bg-gray-100 focus:outline-none focus:bg-gray-200">
              Test Cases
            </button>
          </nav>
        </div>
        <ul>
          {reports.map((report) => (
            <li key={report.id} className="flex items-center justify-between my-2">
              <div>
                <div>
                  <FontAwesomeIcon
                    className={`mr-2 ${report.isCorrect ? "text-green-500" : "text-red-500"}`}
                    icon={["far", report.isCorrect ? "check" : "times"]}
                  />
                  <span className="text-sm">Test #{report.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportId(report.id)}
                className="px-3 py-2 border border-gray-300 text-xs leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150"
              >
                Details
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Details view modal */}
      <Modal
        opened={!!selectedReportId}
        onClose={() => setSelectedReportId(null)}
        centered
        overflow="inside"
        overlayColor="#6B7280"
        size="1024px"
        withCloseButton={false}
        styles={{ modal: { padding: "0px !important" } }}
      >
        {selectedReport ? (
          <>
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Test Case #{selectedReport.id}</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (selectedReportId === null) return;
                      setSelectedReportId(selectedReportId - 1);
                    }}
                    disabled={
                      selectedReportId === null || !reports.some((report) => report.id === selectedReportId - 1)
                    }
                    className="px-3 py-1 flex items-center justify-center gap-2 border border-gray-300 text-blue-600 rounded-md transition hover:text-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={["far", "chevron-left"]} />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedReportId === null) return;
                      setSelectedReportId(selectedReportId + 1);
                    }}
                    disabled={
                      selectedReportId === null || !reports.some((report) => report.id === selectedReportId + 1)
                    }
                    className="px-3 py-1 flex items-center justify-center gap-2 border border-gray-300 text-blue-600 rounded-md transition hover:text-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-100"
                  >
                    <span>Next</span>
                    <FontAwesomeIcon icon={["far", "chevron-right"]} />
                  </button>
                </div>
              </div>
              <nav className="mt-2 flex gap-4">
                <button
                  onClick={() => setViewingMode("stdout")}
                  className={clsx(
                    "px-3 py-2 font-medium text-sm leading-5 rounded-md transition focus:outline-none",
                    viewingMode === "stdout" ? "text-gray-700 bg-gray-100" : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  Standard Output
                </button>
                {selectedReport.stderr.length > 0 && (
                  <button
                    onClick={() => setViewingMode("stderr")}
                    className={clsx(
                      "px-3 py-2 font-medium text-sm leading-5 rounded-md transition focus:outline-none",
                      viewingMode === "stderr" ? "text-gray-700 bg-gray-100" : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    Standard Error
                  </button>
                )}
              </nav>
              {viewingMode === "stdout" && (
                <div className="mt-4 rounded-lg bg-gray-700 shadow-inner border p-3 text-sm text-white font-mono h-80 overflow-y-auto w-full">
                  {selectedReport.stdout.map((line, i) => (
                    <pre key={i}>{line}</pre>
                  ))}
                </div>
              )}
              {viewingMode === "stderr" && (
                <div className="mt-4 rounded-lg bg-gray-700 shadow-inner border p-3 text-sm text-white font-mono h-80 overflow-y-auto w-full">
                  {selectedReport.stderr.map((line, i) => (
                    <pre key={i}>{line}</pre>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-3 flex flex-row-reverse bg-gray-50">
              <button
                onClick={() => setSelectedReportId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

function RunStatus({ allCorrect }) {
  return (
    <span className="ml-2">
      <FontAwesomeIcon
        className={`${allCorrect ? "text-green-500" : "text-red-500"}`}
        icon={["far", allCorrect ? "check" : "times"]}
      />
    </span>
  );
}
