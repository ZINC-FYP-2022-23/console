import { MultiSelect, Select, SelectWithDescription, SwitchGroup, TextInput } from "@components/Input";
import { valgrindDefaultConfig } from "@constants/Config/supportedStages";
import { clsx } from "@mantine/core";
import { ControlledEditor, ControlledEditorProps } from "@monaco-editor/react";
import { useSelectedStageConfig, useStoreActions } from "@state/GuiBuilder/Hooks";
import { StdioTest, TestCase } from "@types";
import cloneDeep from "lodash/cloneDeep";
import { ChangeEventHandler } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { hiddenItemOptions, inputModeOptions, visibilityOptions } from "./inputOptions";

interface StdioTestCaseSettingsProps {
  caseId: number;
}

/**
 * Test case settings page for the "Standard I/O Test" settings panel.
 */
function StdioTestCaseSettings({ caseId }: StdioTestCaseSettingsProps) {
  const [config, setConfig] = useSelectedStageConfig<StdioTest>();
  const caseConfig = config.testCases.find((test) => test.id === caseId);
  if (caseConfig === undefined) {
    console.error(`Cannot find test case of id ${caseId}.`);
    return null;
  }

  /**
   * Updates the store by mutating the data of the current test case.
   * @param callback A callback that updates the test case data.
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

  return (
    <div className="pb-6">
      <p className="mb-6 font-semibold text-xl">Test Case #{caseId}</p>
      <div className="space-y-6">
        <div>
          <p className="mb-2 font-semibold text-lg">Report</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="score" className="flex-[2]">
                Score
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

export default StdioTestCaseSettings;
