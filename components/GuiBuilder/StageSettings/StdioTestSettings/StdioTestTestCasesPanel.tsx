import Button from "@/components/Button";
import { Select, SelectItem } from "@/components/Input";
import { defaultTestCase } from "@/constants/GuiBuilder/defaults";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { getTestCaseNeighborIds, getTestCasesLargestId } from "@/utils/GuiBuilder/stageConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, createStyles, Modal, SelectProps } from "@mantine/core";
import cloneDeep from "lodash/cloneDeep";
import { useMemo, useState } from "react";
import StdioTestCaseSettings from "./StdioTestCaseSettings";
import StdioTestCasesTable from "./StdioTestCasesTable";
import StdioTestCaseDeleteModal from "./StdioTestCaseDeleteModal";
import { useStdioTestSettingsContext } from "./StdioTestSettingsContext";

/**
 * The "Test Cases" tab panel for the `StdioTest` stage.
 */
function StdioTestTestCasesPanel() {
  const { testCaseView, setTestCaseView } = useStdioTestSettingsContext();

  const [config, setConfig] = useSelectedStageConfig("StdioTest");

  /** Which test case to delete. It shows a confirmation modal if it's value is not null. */
  const [testCaseIdToDelete, setTestCaseIdToDelete] = useState<number | null>(null);
  /** Whether the confirmation modal for "Delete All Test Cases" is opened. */
  const [deleteAllModalOpened, setDeleteAllModalOpened] = useState(false);

  const { classes } = useStyles();

  /** Options for selecting which test case to view. */
  const testCaseIdSelectOptions: SelectItem[] = useMemo(() => {
    if (config === null) return [];
    return config.testCases.map((t): SelectItem => ({ value: t.id.toString(), label: t.id.toString() }));
  }, [config]);

  if (!config) return null;

  const addTestCase = () => {
    const testCase = cloneDeep(defaultTestCase);
    testCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, testCase] });
    setTestCaseView(testCase.id);
  };

  const deleteTestCase = (id: number) => {
    const testCases = config.testCases.filter((test) => test.id !== id);
    setConfig({ ...config, testCases });
    setTestCaseIdToDelete(null);
  };

  const duplicateTestCase = (id: number) => {
    const source = config.testCases.find((test) => test.id === id);
    if (!source) return;
    const newTestCase = cloneDeep(source);
    newTestCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, newTestCase] });
    setTestCaseView(newTestCase.id);
  };

  // Table View
  if (testCaseView === "table") {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-5">
          <Button
            onClick={addTestCase}
            icon={<FontAwesomeIcon icon={["fas", "add"]} />}
            className="bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          >
            Add Test Case
          </Button>
          <Button
            onClick={() => setDeleteAllModalOpened(true)}
            icon={<FontAwesomeIcon icon={["fas", "trash-can"]} />}
            className="text-red-500 hover:bg-red-100 active:bg-red-200"
          >
            Delete All Test Cases
          </Button>
        </div>
        <StdioTestCasesTable
          testCases={config.testCases}
          onDuplicate={(testCaseId) => duplicateTestCase(testCaseId)}
          onDelete={(testCaseId) => setTestCaseIdToDelete(testCaseId)}
          onVisit={(testCaseId) => setTestCaseView(testCaseId)}
        />
        {/* Confirmation modal for Delete Single Test Case */}
        <StdioTestCaseDeleteModal
          testCaseIdToDelete={testCaseIdToDelete}
          setTestCaseIdToDelete={setTestCaseIdToDelete}
          onDelete={(id) => deleteTestCase(id)}
        />
        {/* Confirmation modal for Delete All Test Cases */}
        <Modal
          title="Delete all test cases?"
          opened={deleteAllModalOpened}
          onClose={() => setDeleteAllModalOpened(false)}
          centered
          size="md"
          classNames={classes}
        >
          <div className="space-y-5">
            <p className="text-gray-800">Are you sure you want to delete all test cases?</p>
            <div className="w-full flex items-center justify-end gap-3">
              <Button
                onClick={() => setDeleteAllModalOpened(false)}
                className="!font-normal text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setConfig({ ...config, testCases: [] });
                  () => setDeleteAllModalOpened(false);
                }}
                className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
  // Editing a single test case
  else {
    const [prevId, nextId] = getTestCaseNeighborIds(config.testCases, testCaseView);
    return (
      <div>
        <div className="mb-4 p-2 flex items-center justify-between sticky top-0 z-50 bg-blue-50 rounded-md drop-shadow">
          <Button
            onClick={() => setTestCaseView("table")}
            icon={<FontAwesomeIcon icon={["far", "table-list"]} />}
            className="text-blue-600 hover:bg-blue-100 active:bg-blue-200"
          >
            Back to Table View
          </Button>
          <div className="flex items-center gap-3">
            <button
              title="Previous test case"
              onClick={() => {
                prevId !== null && setTestCaseView(prevId);
              }}
              disabled={prevId === null}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full text-lg transition",
                prevId === null
                  ? "cursor-not-allowed text-gray-400"
                  : "text-blue-600 hover:bg-blue-100 active:bg-blue-200",
              )}
            >
              <FontAwesomeIcon icon={["fas", "arrow-left"]} />
            </button>
            <div className="flex items-center gap-2">
              <p className="font-medium text-cool-gray-500">Test Case #</p>
              <Select
                id="selected-test-case-id"
                data={testCaseIdSelectOptions}
                value={testCaseView.toString()}
                onChange={(id) => {
                  if (id === null) return;
                  setTestCaseView(parseInt(id));
                }}
                maxDropdownHeight={350}
                styles={testCaseIdSelectStyles}
              />
            </div>
            <button
              title="Next test case"
              onClick={() => {
                nextId !== null && setTestCaseView(nextId);
              }}
              disabled={nextId === null}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full text-lg transition",

                nextId === null
                  ? "cursor-not-allowed text-gray-400"
                  : "text-blue-600 hover:bg-blue-100 active:bg-blue-200",
              )}
            >
              <FontAwesomeIcon icon={["fas", "arrow-right"]} />
            </button>
          </div>
          <Button
            onClick={addTestCase}
            icon={<FontAwesomeIcon icon={["fas", "add"]} />}
            className="text-green-600 hover:bg-green-100 active:bg-green-200"
          >
            Add Test Case
          </Button>
        </div>
        <StdioTestCaseSettings caseId={testCaseView} />
      </div>
    );
  }
}

/** Styles for the Delete All Test Cases confirmation modal. */
const useStyles = createStyles((theme) => ({
  title: {
    color: theme.colors.red[7],
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
}));

/** Styles for the select item to choose the test case ID to view. */
const testCaseIdSelectStyles: SelectProps["styles"] = {
  wrapper: { maxWidth: "5rem" },
  input: { minHeight: "2rem !important", padding: "0.25rem 0.5rem !important" },
  item: { padding: "0.25rem 0.5rem" },
};

export default StdioTestTestCasesPanel;
