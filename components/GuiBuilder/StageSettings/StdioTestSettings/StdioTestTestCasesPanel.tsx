import Button from "@/components/Button";
import { defaultTestCase } from "@/constants/GuiBuilder/defaults";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { getTestCaseNeighborIds, getTestCasesLargestId } from "@/utils/GuiBuilder/stageConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";
import cloneDeep from "lodash/cloneDeep";
import StdioTestCaseSettings from "./StdioTestCaseSettings";
import StdioTestCasesTable from "./StdioTestCasesTable";

interface StdioTestTestCasesPanelProps {
  /**
   * Which view to show. Either:
   * - "table" = Table view
   * - `number` = Test case ID that is being edited
   */
  view: "table" | number;
  /** Setter for the `view` prop. */
  setView: (view: "table" | number) => void;
  /** A callback that closes the parent modal. */
  closeModal: () => void;
}

/**
 * The "Test Cases" tab panel for the `StdioTest` stage.
 */
function StdioTestTestCasesPanel({ view, setView, closeModal }: StdioTestTestCasesPanelProps) {
  const [config, setConfig] = useSelectedStageConfig("StdioTest");

  if (!config) return null;

  const addTestCase = () => {
    const testCase = cloneDeep(defaultTestCase);
    testCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, testCase] });
    setView(testCase.id);
  };

  const deleteTestCase = (id: number) => {
    const testCases = config.testCases.filter((test) => test.id !== id);
    setConfig({ ...config, testCases });
  };

  const duplicateTestCase = (id: number) => {
    const source = config.testCases.find((test) => test.id === id);
    if (!source) return;
    const newTestCase = cloneDeep(source);
    newTestCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, newTestCase] });
    setView(newTestCase.id);
  };

  // Table View
  if (view === "table") {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={addTestCase}
            icon={<FontAwesomeIcon icon={["fas", "add"]} />}
            className="bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          >
            Add Test Case
          </Button>
          {/* TODO(Anson): Add a "Delete All Test Cases" button. It should display a confirmation modal. */}
        </div>
        <StdioTestCasesTable
          testCases={config.testCases}
          onDuplicate={(testCaseId) => duplicateTestCase(testCaseId)}
          onDelete={(testCaseId) => deleteTestCase(testCaseId)}
          onVisit={(testCaseId) => setView(testCaseId)}
        />
      </div>
    );
  }
  // Editing a single test case
  else {
    const [prevId, nextId] = getTestCaseNeighborIds(config.testCases, view);
    return (
      <div>
        <div className="mb-4 p-2 flex items-center justify-between sticky top-0 z-50 bg-blue-50 rounded-md drop-shadow">
          <Button
            onClick={() => setView("table")}
            icon={<FontAwesomeIcon icon={["far", "table-list"]} />}
            className="text-blue-600 hover:bg-blue-100 active:bg-blue-200"
          >
            Back to Table View
          </Button>
          <p className="text-cool-gray-500">Test Case #{view}</p>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                prevId !== null && setView(prevId);
              }}
              disabled={prevId === null}
              icon={<FontAwesomeIcon icon={["far", "arrow-left"]} />}
              className={clsx(
                prevId === null
                  ? "cursor-not-allowed text-gray-400"
                  : "text-blue-600 hover:bg-blue-100 active:bg-blue-200",
              )}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                nextId !== null && setView(nextId);
              }}
              disabled={nextId === null}
              icon={<FontAwesomeIcon icon={["far", "arrow-right"]} />}
              className={clsx(
                nextId === null
                  ? "cursor-not-allowed text-gray-400"
                  : "text-blue-600 hover:bg-blue-100 active:bg-blue-200",
              )}
            >
              Next
            </Button>
          </div>
        </div>
        <StdioTestCaseSettings caseId={view} closeModal={closeModal} setView={setView} />
      </div>
    );
  }
}

export default StdioTestTestCasesPanel;
