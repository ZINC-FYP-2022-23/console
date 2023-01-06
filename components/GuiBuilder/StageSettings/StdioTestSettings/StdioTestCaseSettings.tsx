import Button from "@components/Button";
import InfoTooltip from "@components/GuiBuilder/Diagnostics/InfoTooltip";
import { MultiSelect, Select, SelectWithDescription, SwitchGroup, TextInput } from "@components/Input";
import { valgrindDefaultConfig } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, Tooltip } from "@mantine/core";
import { ControlledEditor, ControlledEditorProps } from "@monaco-editor/react";
import { useSelectedStageConfig, useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { StdioTest, TestCase } from "@types";
import { getTestCasesLargestId } from "@utils/Config/stageConfig";
import cloneDeep from "lodash/cloneDeep";
import { ChangeEventHandler, memo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  checksFilterOptions as valgrindChecksFilterOptions,
  visibilityOptions as valgrindVisibilityOptions,
} from "../ValgrindSettings";
import { hiddenItemOptions, inputModeOptions, visibilityOptions } from "./inputOptions";

interface StdioTestCaseSettingsProps {
  /** Test case ID. It's `null` when no test case is selected. */
  caseId: number | null;
  /** A callback that closes the current modal. */
  closeModal: () => void;
  /** Sets the page to display. */
  setPage: (page: "settings" | number | null) => void;
}

/**
 * Test case settings page for the "Standard I/O Test" settings panel.
 */
function StdioTestCaseSettings({ caseId, closeModal, setPage }: StdioTestCaseSettingsProps) {
  const [config, setConfig] = useSelectedStageConfig<StdioTest>();
  const hasValgrindStage = useStoreState((state) => state.hasValgrindStage);
  const setAddStageSearchString = useStoreActions((actions) => actions.setAddStageSearchString);

  const [isEditingId, setIsEditingId] = useState(false);
  const [newId, setNewId] = useState("");

  const caseConfig = config.testCases.find((test) => test.id === caseId);
  if (!caseConfig) {
    return <TestCaseEmptyState />;
  }

  const deleteTestCase = () => {
    const testCases = config.testCases.filter((test) => test.id !== caseId);
    setConfig({ ...config, testCases });
    setPage(null);
    setIsEditingId(false);
  };

  const duplicateTestCase = () => {
    const newTestCase = cloneDeep(caseConfig);
    newTestCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, newTestCase] });
    setPage(newTestCase.id);
    setIsEditingId(false);
  };

  /**
   * Updates the store by mutating the data of the current test case.
   * @param callback A callback that updates the test case data, where you can directly mutate the
   * `testCase` parameter.
   */
  const updateTestCase = (callback: (testCase: TestCase) => void) => {
    const index = config.testCases.findIndex((test) => test.id === caseId);
    if (index !== -1) {
      const testCase = cloneDeep(config.testCases[index]);
      callback(testCase);
      setConfig({
        ...config,
        testCases: [...config.testCases.slice(0, index), testCase, ...config.testCases.slice(index + 1)],
      });
    }
  };

  const isNewIdInvalid =
    parseInt(newId) < 1 ||
    config.testCases
      .map((test) => test.id)
      .filter((id) => id !== caseId)
      .includes(parseInt(newId));

  const updateTestCaseId = () => {
    const _newId = parseInt(newId);
    updateTestCase((testCase) => {
      testCase.id = _newId;
    });
    setIsEditingId(false);
    setPage(_newId);
  };

  return (
    <div className="pb-6">
      <div className="mb-6 flex items-center justify-between">
        {isEditingId ? (
          <div className="flex items-center">
            <p className="font-semibold text-xl">Test Case #</p>
            <div className="flex items-center relative">
              <TextInput
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                alertLevel={isNewIdInvalid ? "error" : undefined}
                type="number"
                min={1}
                classNames={{ root: "mx-2", input: "w-24 !px-2 !py-1 text-lg" }}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={updateTestCaseId}
                  className={clsx(
                    "w-7 h-7 flex items-center justify-center rounded-full transition disabled:cursor-not-allowed",
                    isNewIdInvalid
                      ? "bg-gray-300 text-gray-500"
                      : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
                  )}
                  disabled={isNewIdInvalid}
                >
                  <FontAwesomeIcon icon={["fas", "check"]} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingId(false);
                    setNewId(caseId?.toString() ?? "");
                  }}
                  className="w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full transition hover:bg-red-600 active:bg-red-700"
                >
                  <FontAwesomeIcon icon={["fas", "close"]} />
                </button>
              </div>
              {isNewIdInvalid && (
                <p className="ml-2 absolute bottom-[-1.25rem] font-medium text-xs text-red-500">
                  {parseInt(newId) < 1 ? "ID should be greater than 1" : "This ID is already taken"}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <p className="font-semibold text-xl">Test Case #{caseId}</p>
            <Tooltip label="Edit test case ID" position="right">
              <button
                onClick={() => {
                  setNewId(caseId?.toString() ?? "");
                  setIsEditingId(true);
                }}
                className="w-8 h-8 flex items-center justify-center bg-amber-200 text-amber-700 rounded-full transition hover:bg-amber-300 active:bg-amber-400"
              >
                <FontAwesomeIcon icon={["far", "pen-field"]} />
              </button>
            </Tooltip>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            onClick={duplicateTestCase}
            icon={<FontAwesomeIcon icon={["far", "copy"]} />}
            className="bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          >
            Duplicate
          </Button>
          <Button
            onClick={deleteTestCase}
            icon={<FontAwesomeIcon icon={["far", "trash-can"]} />}
            className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <p className="mb-2 font-semibold text-lg">Report</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="score" className="flex-[2]">
                Test case score
              </label>
              <TextInput
                id="score"
                value={caseConfig.score}
                onChange={(e) => updateTestCase((testCase) => (testCase.score = e.target.value))}
                type="number"
                step=".1"
                min="0"
                placeholder="Disable scoring in this test case"
                classNames={{ root: "flex-[3]" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="visibility" className="flex-[2]">
                Visibility to students
              </label>
              <SelectWithDescription
                data={visibilityOptions}
                value={caseConfig.visibility}
                onChange={(value) => value && updateTestCase((testCase) => (testCase.visibility = value))}
                className="flex-[3]"
                maxDropdownHeight={300}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="hide_from_report" className="flex-[2]">
                Items to always hide in report
              </label>
              <div className="flex-[3]">
                <MultiSelect
                  data={hiddenItemOptions}
                  value={caseConfig.hide_from_report ?? []}
                  onChange={(value) => updateTestCase((testCase) => (testCase.hide_from_report = value))}
                  placeholder="No items to hide"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 font-semibold text-lg">Input/Output</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="file" className="flex-[2]">
                File to run <span className="text-red-600">*</span>
              </label>
              <TextInput
                id="file"
                value={caseConfig.file}
                onChange={(e) => updateTestCase((testCase) => (testCase.file = e.target.value))}
                placeholder="e.g. a.out"
                classNames={{ root: "flex-[3]", input: "font-mono placeholder:disabled:font-sans" }}
              />
            </div>
            <div className="flex gap-2">
              <label htmlFor="args" className="mt-2 flex-[2]">
                Command-line arguments
              </label>
              <div className="flex-[3] flex">
                <TextareaAutosize
                  id="flags"
                  value={caseConfig.args ?? ""}
                  onChange={(e) => updateTestCase((testCase) => (testCase.args = e.target.value))}
                  placeholder="e.g. 1"
                  className="w-full py-2 px-3 text-sm font-mono resize-none rounded-md shadow-sm border border-gray-300 transition ease-in-out placeholder:text-gray-400 placeholder:disabled:font-sans focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="_stdinInputMode" className="flex-[2]">
                  Standard input
                </label>
                <div className="flex-[3]">
                  <Select
                    id="_stdinInputMode"
                    value={caseConfig._stdinInputMode}
                    onChange={(e) =>
                      updateTestCase(
                        (testCase) => (testCase._stdinInputMode = e.target.value as TestCase["_stdinInputMode"]),
                      )
                    }
                    extraClassNames="w-full"
                  >
                    {inputModeOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {caseConfig._stdinInputMode === "file" && (
                <HelperFileInputCard
                  value={caseConfig.file_stdin ?? ""}
                  onChange={(e) => updateTestCase((testCase) => (testCase.file_stdin = e.target.value))}
                  placeholder="e.g. stdin_1.txt"
                />
              )}
              {caseConfig._stdinInputMode === "text" && (
                <MonacoEditorCard
                  cardTitle="Content of standard input"
                  value={caseConfig.stdin}
                  onChange={(_, val) => updateTestCase((testCase) => (testCase.stdin = val))}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="_expectedInputMode" className="flex-[2]">
                Expected output
              </label>
              <div className="flex-[3]">
                <Select
                  id="_expectedInputMode"
                  value={caseConfig._expectedInputMode}
                  onChange={(e) =>
                    updateTestCase(
                      (testCase) => (testCase._expectedInputMode = e.target.value as TestCase["_expectedInputMode"]),
                    )
                  }
                  extraClassNames="w-full"
                >
                  {inputModeOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {caseConfig._expectedInputMode === "file" && (
              <HelperFileInputCard
                value={caseConfig.file_expected ?? ""}
                onChange={(e) => updateTestCase((testCase) => (testCase.file_expected = e.target.value))}
                placeholder="e.g. expected_1.txt"
              />
            )}
            {caseConfig._expectedInputMode === "text" && (
              <MonacoEditorCard
                cardTitle="Content of expected output"
                value={caseConfig.expected}
                onChange={(_, val) => updateTestCase((testCase) => (testCase.expected = val))}
              />
            )}
          </div>
        </div>
        <div>
          <p className="mb-4 font-semibold text-lg">Valgrind</p>
          <div className="space-y-5">
            <div>
              <SwitchGroup
                label="Override config from Valgrind stage"
                checked={caseConfig._valgrindOverride}
                onChange={(value) =>
                  updateTestCase((testCase) => {
                    testCase._valgrindOverride = value;
                    if (value && !testCase.valgrind) {
                      testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                    }
                  })
                }
              />
              {caseConfig._valgrindOverride && !hasValgrindStage && (
                <div className="px-4 py-3 mt-3 flex items-center gap-4 bg-yellow-100 text-yellow-800 rounded-md">
                  <FontAwesomeIcon icon={["far", "triangle-exclamation"]} className="text-xl text-yellow-600" />
                  <p>
                    Your grading pipeline is missing a{" "}
                    <button
                      className="text-blue-700 underline"
                      onClick={() => {
                        closeModal();
                        setAddStageSearchString("Valgrind");
                      }}
                    >
                      Valgrind stage
                    </button>
                    . Please add it back.
                  </p>
                </div>
              )}
            </div>
            <SwitchGroup
              label="Run Valgrind on this test case"
              checked={caseConfig.valgrind?.enabled ?? valgrindDefaultConfig.enabled}
              onChange={(value) =>
                updateTestCase((testCase) => {
                  if (!testCase.valgrind) testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                  testCase.valgrind.enabled = value;
                })
              }
              disabled={!caseConfig._valgrindOverride}
            />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex gap-2">
              <div className="flex-[2] flex items-center gap-1">
                <label htmlFor="valgrind.score" className={!caseConfig._valgrindOverride ? "text-gray-400" : ""}>
                  Valgrind score
                </label>
                <ValgrindScoreTooltip />
              </div>
              <TextInput
                id="valgrind.score"
                value={caseConfig.valgrind?.score ?? ""}
                onChange={(e) =>
                  updateTestCase((testCase) => {
                    if (!testCase.valgrind) testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                    testCase.valgrind.score = e.target.value;
                  })
                }
                disabled={!caseConfig._valgrindOverride}
                type="number"
                step=".1"
                min="0"
                placeholder={caseConfig.score ? caseConfig.score : "Use the score value from the Valgrind stage"}
                classNames={{ root: "flex-[3]" }}
              />
            </div>
            <div className="flex gap-2">
              <label
                htmlFor="valgrind.checksFilter"
                className={clsx("mt-2 flex-[2]", !caseConfig._valgrindOverride && "text-gray-400")}
              >
                Visibility to students
              </label>
              <SelectWithDescription
                data={valgrindVisibilityOptions}
                value={caseConfig.valgrind?.visibility ?? valgrindDefaultConfig.visibility}
                onChange={(value) => {
                  updateTestCase((testCase) => {
                    if (!value) return;
                    if (!testCase.valgrind) testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                    testCase.valgrind.visibility = value;
                  });
                }}
                disabled={!caseConfig._valgrindOverride}
                className="flex-[3]"
                maxDropdownHeight={320}
              />
            </div>
            <div className="flex gap-2">
              <label
                htmlFor="valgrind.checksFilter"
                className={clsx("mt-2 flex-[2]", !caseConfig._valgrindOverride && "text-gray-400")}
              >
                Errors to check
              </label>
              <div className="flex-[3]">
                <MultiSelect
                  data={valgrindChecksFilterOptions}
                  value={caseConfig.valgrind?.checksFilter ?? valgrindDefaultConfig.checksFilter}
                  onChange={(value) => {
                    updateTestCase((testCase) => {
                      if (!testCase.valgrind) testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                      testCase.valgrind.checksFilter = value;
                    });
                  }}
                  disabled={!caseConfig._valgrindOverride}
                  placeholder="Select errors..."
                  showAbove
                />
              </div>
            </div>
            <div className="flex gap-2">
              <label
                htmlFor="valgrind.args"
                className={clsx("mt-2 flex-[2]", !caseConfig._valgrindOverride && "text-gray-400")}
              >
                Valgrind command-line options
              </label>
              <div className="flex-[3] flex">
                <TextareaAutosize
                  id="valgrind.args"
                  value={caseConfig.valgrind?.args ?? ""}
                  onChange={(e) => {
                    updateTestCase((testCase) => {
                      if (!testCase.valgrind) testCase.valgrind = cloneDeep(valgrindDefaultConfig);
                      testCase.valgrind.args = e.target.value;
                    });
                  }}
                  placeholder="e.g. --leak-check=full"
                  className="w-full py-2 px-3 text-sm font-mono resize-none rounded-md shadow-sm border border-gray-300 transition ease-in-out placeholder:text-gray-400 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-gray-100"
                  disabled={!caseConfig._valgrindOverride}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestCaseEmptyState() {
  return (
    <div className="mt-40 flex flex-col items-center text-gray-400">
      <p className="mb-6 font-medium text-gray-500 text-xl">No test case selected</p>
      <p>Please select a test case at the left sidebar.</p>
      <p>You can also press the &quot;Add Test&quot; button to create one.</p>
    </div>
  );
}

interface HelperFileInputCardProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}

/**
 * A card for users to input the helper file name in "Standard input" and "Expected output".
 */
function HelperFileInputCard({ value, onChange, placeholder }: HelperFileInputCardProps) {
  const setStep = useStoreActions((actions) => actions.setStep);
  return (
    <div className="mb-3 mx-2 p-3 bg-gray-50 rounded-lg drop-shadow">
      <ol className="pl-4 mb-2 text-gray-600 text-sm list-decimal">
        <li>
          Upload the helper file to{" "}
          <button onClick={() => setStep("upload")} className="underline text-blue-700">
            Helper files used for grading
          </button>
        </li>
        <li>Input the helper file name below:</li>
      </ol>
      <TextInput
        id="file_stdin"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        classNames={{ root: "ml-4", input: "font-mono" }}
      />
    </div>
  );
}

interface MonacoEditorCardProps extends ControlledEditorProps {
  cardTitle: string;
}

/**
 * A card with Monaco Editor for users to input the content of standard input or expected output.
 */
function MonacoEditorCard({ cardTitle, ...props }: MonacoEditorCardProps) {
  return (
    <div className="h-80 mb-3 mx-2 p-3 pt-1 pb-8 bg-gray-50 rounded-lg drop-shadow">
      <p className="mb-1 text-gray-600 text-sm">{cardTitle}</p>
      <ControlledEditor options={{ fontSize: 12.5 }} {...props} />
    </div>
  );
}

const ValgrindScoreTooltip = memo(() => (
  <InfoTooltip width={520}>
    <ul className="px-3 text-sm list-disc">
      <li>
        If this field is blank, it uses the score value from the &quot;Test case score&quot; field at the very top.
      </li>
      <li>
        If both this field and the &quot;Test case score&quot; field are blank, it uses the score value from the
        Valgrind stage of your grading pipeline.
      </li>
    </ul>
  </InfoTooltip>
));
ValgrindScoreTooltip.displayName = "ValgrindScoreTooltip";

export default StdioTestCaseSettings;
