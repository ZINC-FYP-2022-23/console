import Button from "@/components/Button";
import { NumberInput, TagsInput, Textarea } from "@/components/Input";
import { defaultXUnitOverride } from "@/constants/GuiBuilder/defaults";
import { useQueryParameters, useSelectedStageConfig, useSelectedStageDiagnostics } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Diagnostic } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, Tooltip } from "@mantine/core";
import cloneDeep from "lodash/cloneDeep";
import { FocusEventHandler, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Alert } from "../Diagnostics";
import {
  ScorablePolicyRadioGroup,
  StageConfigModal,
  TotalScorableSettings,
  WeightedScorableOverrides,
  testCaseScorablePolicyOptions,
  xUnitOverridePredicatesData,
} from "./common";

function PyTestSettings() {
  const [config, setConfig] = useSelectedStageConfig("PyTest");

  const language = useStoreState((state) => state.config.editingConfig._settings.lang.language);

  const [modalOpened, setModalOpened] = useState(false);

  if (!config) return null;

  /** If user has typed something in the `additional_pip_packages` input, add it to the list of tags. */
  const onTagInputBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim();
    if (value === "") return;
    if (!config.additional_pip_packages.includes(value)) {
      setConfig({ ...config, additional_pip_packages: [...config.additional_pip_packages, value] });
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="h-full p-4 flex flex-col">
        {language !== "python" && <LangNotPythonAlert />}
        <div className="mb-16 flex-1 flex flex-col items-center justify-center">
          <p className="mb-5 text-lg text-gray-500">To edit the stage settings, press the button below.</p>
          <Button
            className="bg-cse-600 text-white text-lg hover:bg-cse-700"
            icon={<FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />}
            onClick={() => setModalOpened(true)}
          >
            Edit Stage Configuration
          </Button>
        </div>
      </div>
      <StageConfigModal opened={modalOpened} onClose={() => setModalOpened(false)} title="PyTest Stage Configuration">
        <ScrollArea type="auto" offsetScrollbars className="pr-1 h-full">
          <div className="pt-1 space-y-4">
            <div className="flex gap-3">
              <div className="mt-2 flex-1">
                <div className="flex items-center gap-3">
                  <label htmlFor="args">
                    <code>pytest</code> command-line options
                  </label>
                  <Tooltip label="Documentation on PyTest command-line options">
                    <a
                      href="https://docs.pytest.org/en/latest/reference/reference.html#command-line-flags"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 flex items-center text-blue-500 rounded-full transition hover:bg-blue-100"
                    >
                      <FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />
                    </a>
                  </Tooltip>
                </div>
              </div>
              <Textarea
                id="args"
                value={config.args}
                onChange={(e) => setConfig({ ...config, args: e.target.value })}
                placeholder="e.g. --maxfail=2"
                monospace
                styles={{ root: { flex: 2 } }}
              />
            </div>
            <div className="flex gap-3">
              <div className="mt-2 flex-1">
                <label htmlFor="additional_pip_packages">Pip package dependencies</label>
                <p className="text-gray-500 text-xs">Required by the submission and your test suite</p>
              </div>
              <TagsInput
                id="additional_pip_packages"
                value={config.additional_pip_packages}
                onChange={(tags) => setConfig({ ...config, additional_pip_packages: tags })}
                onBlur={onTagInputBlur}
                placeHolder={config.additional_pip_packages.length === 0 ? "e.g. numpy" : ""}
                className="flex-[2] font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-6 mx-1">
            <p className="mb-3 font-semibold text-lg">Scoring Policy</p>
            <div className="mb-7">
              <ScorablePolicyRadioGroup
                options={testCaseScorablePolicyOptions}
                value={config._scorePolicy}
                onChange={(value) => setConfig({ ...config, _scorePolicy: value })}
              />
            </div>
            {config._scorePolicy === "total" && (
              <TotalScorableSettings
                score={config.score}
                onChangeScore={(score) => {
                  if (score === undefined) return;
                  setConfig({ ...config, score });
                }}
                treatDenormalScore={config.treatDenormalScore ?? "IGNORE"}
                onChangeTreatDenormalScore={(value) => setConfig({ ...config, treatDenormalScore: value ?? undefined })}
              />
            )}
            {config._scorePolicy === "weighted" && (
              <>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <label htmlFor="scoreWeighting-default" className="flex-1">
                      Default score of each test case <span className="text-red-600 text-xs">(required)</span>
                    </label>
                    <NumberInput
                      id="scoreWeighting-default"
                      value={config.scoreWeighting?.default}
                      onChange={(value) => {
                        if (value === undefined) return;
                        setConfig({ ...config, scoreWeighting: { ...config.scoreWeighting, default: value } });
                      }}
                      min={0}
                      placeholder="e.g. 1"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 flex-1">
                      <label htmlFor="scoreWeighting-limit">Upper limit of this stage&apos;s score</label>
                      <p className="text-gray-500 text-xs">Leave blank to disable upper limit</p>
                    </div>
                    <NumberInput
                      id="scoreWeighting-limit"
                      value={config.scoreWeighting?.limit}
                      onChange={(value) => {
                        setConfig({ ...config, scoreWeighting: { ...config.scoreWeighting, limit: value } });
                      }}
                      min={0}
                      placeholder="No upper limit"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="font-semibold">Score Overrides</p>
                    <p className="leading-none text-gray-500 text-xs">
                      Specify which test cases should contribute more/less marks
                    </p>
                  </div>
                  <WeightedScorableOverrides
                    data={xUnitOverridePredicatesData}
                    overrides={config.scoreWeighting.overrides}
                    setOverrides={(overrides) => {
                      setConfig({ ...config, scoreWeighting: { ...config.scoreWeighting, overrides } });
                    }}
                    onAddOverride={() => {
                      const newOverride = cloneDeep(defaultXUnitOverride);
                      newOverride._uuid = uuidv4();
                      const overrides = [...config.scoreWeighting.overrides, newOverride];
                      setConfig({ ...config, scoreWeighting: { ...config.scoreWeighting, overrides } });
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </StageConfigModal>
    </>
  );
}

/**
 * Alert to show when the language is not Python, since PyTest can only be used in Python assignments.
 */
function LangNotPythonAlert() {
  const { updateStep } = useQueryParameters();
  const [diagnostics] = useSelectedStageDiagnostics();
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const isLangNotPythonError = (d: Diagnostic) =>
    d.type === "INVALID_FIELD_ERROR" && d.fields?.includes("_settings.lang");
  const hasLangNotPythonError = diagnostics.some(isLangNotPythonError);

  return (
    <Alert severity={hasLangNotPythonError ? "error" : "warning"} data-cy="lang-not-python-alert">
      <div>
        <p>
          You must set the language to <span className="font-semibold">Python</span> in order to use PyTest.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button
            icon={<FontAwesomeIcon icon={["fas", "edit"]} />}
            onClick={() => {
              updateStep("settings");
              setElementToHighlight("lang");
            }}
            className="bg-cse-600 text-sm text-white hover:bg-cse-500 active:bg-cse-400"
          >
            Change language
          </Button>
          <Button
            icon={<FontAwesomeIcon icon={["far", "trash-can"]} />}
            onClick={() => setModal({ path: "deleteStage", value: true })}
            className="bg-red-500 text-sm text-white hover:bg-red-600"
          >
            Delete this stage
          </Button>
        </div>
      </div>
    </Alert>
  );
}

export default PyTestSettings;
