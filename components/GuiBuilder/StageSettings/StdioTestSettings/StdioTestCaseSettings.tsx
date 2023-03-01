import Button from "@/components/Button";
import { MultiSelect, NumberInput, Select, SwitchGroup, Textarea, TextInput } from "@/components/Input";
import { defaultValgrindConfig } from "@/constants/GuiBuilder/defaults";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { TestCase } from "@/types/GuiBuilder";
import { getTestCasesLargestId } from "@/utils/GuiBuilder/stageConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, Tooltip } from "@mantine/core";
import { ControlledEditor, ControlledEditorProps } from "@monaco-editor/react";
import cloneDeep from "lodash/cloneDeep";
import { ChangeEventHandler, memo, useState } from "react";
import { InfoTooltip } from "../../Diagnostics";
import {
  checksFilterOptions as valgrindChecksFilterOptions,
  visibilityOptions as valgrindVisibilityOptions,
} from "../ValgrindSettings";
import { hiddenItemOptions, inputModeOptions, visibilityOptions } from "./inputOptions";
import { useStdioTestSettingsContext } from "./StdioTestSettingsContext";

interface StdioTestCaseSettingsProps {
  /** Test case ID. */
  caseId: number;
}

/**
 * Settings for a single test case in `StdioTest` stage.
 */
function StdioTestCaseSettings({ caseId }: StdioTestCaseSettingsProps) {
  const { closeModal, setTestCaseView } = useStdioTestSettingsContext();

  const [config, setConfig] = useSelectedStageConfig("StdioTest");
  const hasValgrindStage = useStoreState((state) => state.config.hasStage("Valgrind"));
  const setAddStageSearchString = useStoreActions((actions) => actions.layout.setAddStageSearchString);

  const [isEditingId, setIsEditingId] = useState(false);
  const [newId, setNewId] = useState<number | null>(caseId);

  if (!config) return null;

  const caseConfig = config.testCases.find((test) => test.id === caseId);
  if (!caseConfig) {
    return null;
  }

  const deleteTestCase = () => {
    const testCases = config.testCases.filter((test) => test.id !== caseId);
    setConfig({ ...config, testCases });
    setTestCaseView("table");
    setIsEditingId(false);
  };

  const duplicateTestCase = () => {
    const newTestCase = cloneDeep(caseConfig);
    newTestCase.id = getTestCasesLargestId(config.testCases) + 1;
    setConfig({ ...config, testCases: [...config.testCases, newTestCase] });
    setTestCaseView(newTestCase.id);
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
    newId === null ||
    newId < 1 ||
    config.testCases
      .map((test) => test.id)
      .filter((id) => id !== caseId)
      .includes(newId);

  const updateTestCaseId = () => {
    if (newId === null) return;
    updateTestCase((testCase) => {
      testCase.id = newId;
    });
    setIsEditingId(false);
    setTestCaseView(newId);
  };

  return (
    <div className="pb-6">
      <div className="mb-6 flex items-center justify-between">
        {isEditingId ? (
          <div className="flex items-center">
            <p className="font-semibold text-xl">Test Case #</p>
            <div className="flex items-center relative">
              <NumberInput
                value={newId ?? undefined}
                onChange={(value) => setNewId(value ?? null)}
                alertLevel={isNewIdInvalid ? "error" : undefined}
                min={1}
                className="mx-2 mt-1"
                styles={{
                  input: {
                    width: "6rem",
                    padding: "0.25rem 0.5rem !important",
                    fontSize: "1.125rem !important",
                  },
                }}
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
                  title="Save new ID"
                  disabled={isNewIdInvalid}
                >
                  <FontAwesomeIcon icon={["fas", "check"]} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingId(false);
                    setNewId(caseId);
                  }}
                  title="Cancel"
                  className="w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full transition hover:bg-red-600 active:bg-red-700"
                >
                  <FontAwesomeIcon icon={["fas", "close"]} />
                </button>
              </div>
              {isNewIdInvalid && (
                <p className="ml-2 absolute bottom-[-1.25rem] font-medium text-xs text-red-500">
                  {newId === null || newId < 1 ? "ID should be greater than 1" : "This ID is already taken"}
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
                  setNewId(caseId);
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
              <NumberInput
                id="score"
                value={caseConfig.score}
                onChange={(value) => updateTestCase((testCase) => (testCase.score = value))}
                precision={1}
                step={0.1}
                min={0}
                placeholder="Disable scoring in this test case"
                className="flex-[3]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="visibility" className="flex-[2]">
                Visibility to students
              </label>
              <Select
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
                File to run <span className="text-red-600 text-xs">(required)</span>
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
              <Textarea
                id="flags"
                value={caseConfig.args ?? ""}
                onChange={(e) => updateTestCase((testCase) => (testCase.args = e.target.value))}
                placeholder="e.g. 1"
                monospace
                styles={{ root: { flex: 3 } }}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="_stdinInputMode" className="flex-[2]">
                  Standard input
                </label>
                <Select
                  id="_stdinInputMode"
                  data={inputModeOptions}
                  value={caseConfig._stdinInputMode}
                  onChange={(value) => {
                    if (value === null) return;
                    updateTestCase((testCase) => (testCase._stdinInputMode = value));
                  }}
                  styles={{ root: { flex: 3 } }}
                />
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
              <Select
                id="_expectedInputMode"
                data={inputModeOptions}
                value={caseConfig._expectedInputMode}
                onChange={(value) => {
                  if (value === null) return;
                  updateTestCase((testCase) => (testCase._expectedInputMode = value));
                }}
                styles={{ root: { flex: 3 } }}
              />
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
                      testCase.valgrind = cloneDeep(defaultValgrindConfig);
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
                        setAddStageSearchString(supportedStages.Valgrind.nameInUI);
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
              checked={caseConfig.valgrind?.enabled ?? defaultValgrindConfig.enabled}
              onChange={(value) =>
                updateTestCase((testCase) => {
                  if (!testCase.valgrind) testCase.valgrind = cloneDeep(defaultValgrindConfig);
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
              <NumberInput
                id="valgrind.score"
                value={caseConfig.valgrind?.score}
                onChange={(value) =>
                  updateTestCase((testCase) => {
                    if (!testCase.valgrind) testCase.valgrind = cloneDeep(defaultValgrindConfig);
                    testCase.valgrind.score = value;
                  })
                }
                disabled={!caseConfig._valgrindOverride}
                precision={1}
                step={0.1}
                min={0}
                placeholder={caseConfig.score?.toString() ?? "Use the score value from the Valgrind stage"}
                className="flex-[3]"
              />
            </div>
            <div className="flex gap-2">
              <label
                htmlFor="valgrind.visibility"
                className={clsx("mt-2 flex-[2]", !caseConfig._valgrindOverride && "text-gray-400")}
              >
                Visibility to students
              </label>
              <Select
                id="valgrind.visibility"
                data={valgrindVisibilityOptions}
                value={caseConfig.valgrind?.visibility ?? defaultValgrindConfig.visibility}
                onChange={(value) => {
                  updateTestCase((testCase) => {
                    if (!value) return;
                    if (!testCase.valgrind) testCase.valgrind = cloneDeep(defaultValgrindConfig);
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
                  value={caseConfig.valgrind?.checksFilter ?? defaultValgrindConfig.checksFilter}
                  onChange={(value) => {
                    updateTestCase((testCase) => {
                      if (!testCase.valgrind) testCase.valgrind = cloneDeep(defaultValgrindConfig);
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
              <Textarea
                id="valgrind.args"
                value={caseConfig.valgrind?.args ?? ""}
                onChange={(e) => {
                  updateTestCase((testCase) => {
                    if (!testCase.valgrind) testCase.valgrind = cloneDeep(defaultValgrindConfig);
                    testCase.valgrind.args = e.target.value;
                  });
                }}
                placeholder="e.g. --leak-check=full"
                disabled={!caseConfig._valgrindOverride}
                monospace
                styles={{ root: { flex: 3 } }}
              />
            </div>
          </div>
        </div>
      </div>
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
  const setStep = useStoreActions((actions) => actions.layout.setStep);
  return (
    <div className="mb-3 mx-2 p-3 bg-gray-50 rounded-lg drop-shadow">
      <ol className="pl-4 mb-2 text-gray-600 text-sm list-decimal">
        <li>
          Upload the helper file to{" "}
          <button onClick={() => setStep("upload")} className="underline text-blue-700">
            Additional files used for grading
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
    <div className="h-80 mb-3 p-3 pt-1 pb-8 bg-gray-50 rounded-lg drop-shadow">
      <p className="mb-1 text-gray-600 text-sm">{cardTitle}</p>
      <ControlledEditor options={{ fontSize: 12.5 }} {...props} />
    </div>
  );
}

const ValgrindScoreTooltip = memo(() => (
  <InfoTooltip width={550}>
    <ul className="px-3 text-sm list-disc">
      <li>
        If this field is blank, it uses the score value from the &quot;Test case score&quot; field at the very top.
      </li>
      <li>
        If both this field and the &quot;Test case score&quot; field are blank, it uses the &quot;Default Valgrind
        score&quot; value from the Valgrind stage of your grading pipeline.
      </li>
    </ul>
  </InfoTooltip>
));
ValgrindScoreTooltip.displayName = "ValgrindScoreTooltip";

export default StdioTestCaseSettings;
