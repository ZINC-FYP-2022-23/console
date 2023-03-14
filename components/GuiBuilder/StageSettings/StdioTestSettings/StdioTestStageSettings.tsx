import Button from "@/components/Button";
import { MultiSelect, SwitchGroup, TagsInput } from "@/components/Input";
import { highlightableElementIds } from "@/constants/GuiBuilder/highlightableElements";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IsGeneratedFolderEmptyResponse } from "pages/api/configs/[assignmentConfigId]/generated";
import { FocusEventHandler, memo, useEffect, useState } from "react";
import { InfoTooltip } from "../../Diagnostics";
import { diffIgnoreFlagOptions } from "./inputOptions";

/**
 * Overall stage settings for the `StdioTest` stage.
 */
function StdioTestStageSettings() {
  const [config, setConfig] = useSelectedStageConfig("StdioTest");
  const language = useStoreState((state) => state.config.editingConfig._settings.lang.language);

  if (!config) return null;

  const isPipDisabled = language !== "python" && !config.additional_packages.includes("python3-pip");

  /** If user has typed something in the input box of tags input, add it to the list of tags. */
  const onTagInputBlur = (
    target: "additional_packages" | "additional_pip_packages",
  ): FocusEventHandler<HTMLInputElement> => {
    return (e) => {
      const value = e.target.value.trim();
      if (value === "") return;
      if (!config[target]!.includes(value)) {
        setConfig({ ...config, [target]: [...(config[target] as string[]), value] });
        e.target.value = "";
      }
    };
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-[2]">
            <label htmlFor="diff_ignore_flags">Diff ignore flags</label>
            <p className="text-xs text-gray-500">
              What to ignore when comparing standard output against expected output
            </p>
          </div>
          <div className="flex-[3]">
            <MultiSelect
              data={diffIgnoreFlagOptions}
              value={config.diff_ignore_flags}
              onChange={(value) => setConfig({ ...config, diff_ignore_flags: value })}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-[2]">
            <div className="flex items-center gap-1">
              <label htmlFor="additional_packages">Additional packages</label>
              <AdditionalPackagesTooltip />
            </div>
          </div>
          <TagsInput
            name="additional_packages"
            value={config.additional_packages}
            onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
            onBlur={onTagInputBlur("additional_packages")}
            placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
            className="flex-[3] font-mono text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-[2]">
            <div className="flex items-center gap-1">
              <label htmlFor="additional_pip_packages">Additional pip packages</label>
              <AdditionalPipPackagesTooltip />
            </div>
          </div>
          <div className="flex-[3]">
            <TagsInput
              name="additional_pip_packages"
              value={config.additional_pip_packages}
              onChange={(tags) => setConfig({ ...config, additional_pip_packages: tags })}
              onBlur={onTagInputBlur("additional_pip_packages")}
              disabled={isPipDisabled}
              placeHolder={
                isPipDisabled && config.additional_pip_packages.length === 0
                  ? "Add `python3-pip` to 'Additional packages' first"
                  : ""
              }
              className="font-mono text-sm"
            />
            {isPipDisabled && config.additional_pip_packages.length > 0 && (
              <p className="text-xs mt-1 text-orange-600">
                Please add <code>python3-pip</code> to &quot;Additional packages&quot; first
              </p>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 flex items-center gap-2">
          <span className="font-semibold text-lg">Experimental Features</span>
          <span className="px-2 bg-green-500 font-semibold leading-5 text-xs text-white rounded-full">New</span>
        </p>
        <div id={highlightableElementIds.generateExpectedOutput} className="p-3 bg-gray-50 rounded-md drop-shadow">
          <SwitchGroup
            label="Auto-generate expected output of test cases"
            description={generateExpectedOutputDescription}
            checked={config.generate_expected_output}
            onChange={(value) => setConfig({ ...config, generate_expected_output: value })}
          />
          {config.generate_expected_output && <GenerateExpectedOutputStepsToComplete />}
        </div>
      </div>
    </div>
  );
}

const tickIcon = <FontAwesomeIcon icon={["far", "circle-check"]} className="text-xl text-green-600" />;
const crossIcon = <FontAwesomeIcon icon={["far", "circle-xmark"]} className="text-xl text-red-600" />;

/**
 * Steps to complete if `config.generate_expected_output` is on.
 */
function GenerateExpectedOutputStepsToComplete() {
  const configId = useStoreState((state) => state.config.configId);
  const settingsUseGenerated = useStoreState((state) => state.config.editingConfig._settings.use_generated);
  const updateSettings = useStoreActions((actions) => actions.config.updateSettings);
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);
  const setStep = useStoreActions((actions) => actions.layout.setStep);

  const [isGeneratedEmpty, setIsGeneratedEmpty] = useState(true);

  useEffect(() => {
    const checkIsGeneratedEmpty = async () => {
      try {
        const response = await fetch(`/api/configs/${configId}/generated`);
        const data = (await response.json()) as IsGeneratedFolderEmptyResponse;
        setIsGeneratedEmpty(data.isEmpty);
      } catch (error) {
        console.error("Error while checking if `generated` is empty", error);
      }
    };

    if (configId !== null) checkIsGeneratedEmpty();
  }, [configId]);

  return (
    <div className="ml-16 mt-3 space-y-3 text-sm text-gray-700">
      <p className="font-medium">Steps to complete:</p>
      <div className="flex gap-3 items-center">
        {settingsUseGenerated ? (
          <>
            {tickIcon}
            <p>
              Enable &quot;
              <button
                onClick={() => {
                  setStep("settings");
                  setElementToHighlight("useGenerated");
                }}
                title="Show me the location"
                className="text-blue-700 underline"
              >
                Allow access to files generated by Grader
              </button>
              &quot;
            </p>
          </>
        ) : (
          <>
            {crossIcon}
            <Button
              onClick={() => updateSettings((_settings) => (_settings.use_generated = true))}
              icon={<FontAwesomeIcon icon={["fas", "check"]} />}
              className="border border-cse-600 text-sm hover:bg-blue-100 active:bg-blue-200"
            >
              Enable &quot;Allow access to files generated by Grader&quot;
            </Button>
          </>
        )}
      </div>
      <div className="flex gap-3">
        {isGeneratedEmpty ? crossIcon : tickIcon}
        <div className="space-y-1">
          <p>Submit this assignment&apos;s solution to generate the expected outputs:</p>
          <ol className="ml-5 list-decimal">
            <li>
              Visit the <span className="font-semibold">Submissions</span> step
            </li>
            <li>
              Press the <span className="font-semibold">Submit Assignment Solution</span> button to submit this
              assignment&apos;s solution
            </li>
            <li>Wait for the Grader to process the solution</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const AdditionalPackagesTooltip = memo(() => (
  <InfoTooltip>
    <ul className="px-3 text-sm list-disc">
      <li>Dependencies to install before running the executable to test its output</li>
      <li>
        They will be installed by your container&apos;s package manager (e.g. <code>apt-get</code>)
      </li>
    </ul>
  </InfoTooltip>
));
AdditionalPackagesTooltip.displayName = "AdditionalPackagesTooltip";

const AdditionalPipPackagesTooltip = memo(() => (
  <InfoTooltip width={540}>
    <ul className="px-3 text-sm list-disc">
      <li>
        <a href="https://pypi.org/project/pip/" target="_blank" rel="noreferrer" className="underline text-blue-700">
          Pip
        </a>{" "}
        packages to install before running the executable to test its output
      </li>
      <li>
        If you&apos;re not using Python, you must first add <code>python3-pip</code> in &quot;Additional packages&quot;
        to install Pip
      </li>
    </ul>
  </InfoTooltip>
));
AdditionalPipPackagesTooltip.displayName = "AdditionalPipPackagesTooltip";

const generateExpectedOutputDescription = (
  <ul className="pl-5 pt-1 list-disc text-sm text-gray-500">
    <li>Removes the need to manually input each test case&apos;s expected output</li>
    <li>Useful if you have many test cases or your test cases have very long outputs</li>
  </ul>
);

export default StdioTestStageSettings;
