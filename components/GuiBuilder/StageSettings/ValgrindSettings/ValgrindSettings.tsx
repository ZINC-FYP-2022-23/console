import Alert from "@components/GuiBuilder/Diagnostics/Alert";
import InfoTooltip from "@components/GuiBuilder/Diagnostics/InfoTooltip";
import { MultiSelect, NumberInput, SelectWithDescription, SwitchGroup, Textarea } from "@components/Input";
import supportedStages, { valgrindDefaultConfig } from "@constants/Config/supportedStages";
import { useSelectedStageConfig, useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { Valgrind } from "@types";
import { memo } from "react";
import { checksFilterOptions, visibilityOptions } from "./inputOptions";

function ValgrindSettings() {
  const [config, setConfig] = useSelectedStageConfig<Valgrind>();
  const hasStdioTestStage = useStoreState((state) => state.hasStage("StdioTest"));
  const setAddStageSearchString = useStoreActions((actions) => actions.setAddStageSearchString);

  return (
    <div className="p-3 flex flex-col gap-4">
      {!hasStdioTestStage && (
        <Alert severity="warning">
          <p>
            Your grading pipeline is missing a{" "}
            <button
              className="text-blue-700 underline"
              onClick={() => setAddStageSearchString(supportedStages.StdioTest.nameInUI)}
            >
              Standard I/O Test stage
            </button>
            . Please add it back.
          </p>
        </Alert>
      )}
      <SwitchGroup
        label='Run Valgrind on all test cases in "Standard I/O Test" stage'
        checked={config.enabled}
        onChange={(value) => setConfig({ ...config, enabled: value })}
      />
      <div className="flex items-center">
        <div className="flex-1 flex items-center gap-1">
          <label htmlFor="score">Default Valgrind score</label>
          <ScoreTooltip />
        </div>
        <NumberInput
          id="score"
          value={config.score}
          onChange={(score) => setConfig({ ...config, score })}
          precision={1}
          step={0.1}
          min={0}
          placeholder="Use test case's score"
          className="flex-[2]"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="visibility" className="flex-1">
          Visibility to students
        </label>
        <SelectWithDescription
          id="visibility"
          data={visibilityOptions}
          value={config.visibility ?? valgrindDefaultConfig.visibility}
          onChange={(value) => {
            if (!value) return;
            setConfig({ ...config, visibility: value });
          }}
          className="flex-[2]"
          maxDropdownHeight={320}
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="checksFilter" className="flex-1">
          Errors to check
        </label>
        <div className="flex-[2]">
          <MultiSelect
            data={checksFilterOptions}
            value={config.checksFilter ?? valgrindDefaultConfig.checksFilter}
            onChange={(value) => setConfig({ ...config, checksFilter: value })}
            placeholder="Select errors..."
          />
        </div>
      </div>
      <div className="flex">
        <label htmlFor="args" className="mt-2 flex-1">
          Valgrind command-line options
        </label>
        <div className="flex-[2] flex">
          <Textarea
            id="args"
            value={config.args ?? ""}
            onChange={(e) => setConfig({ ...config, args: e.target.value })}
            placeholder="e.g. --leak-check=full"
            monospace
            styles={{ root: { width: "100%" } }}
          />
        </div>
      </div>
    </div>
  );
}

const ScoreTooltip = memo(() => (
  <InfoTooltip width={550}>
    <ul className="px-3 text-sm list-disc">
      <li>
        If you&apos;ve set a score in a test case, the score of passing Valgrind is equal to that test case&apos;s
        score, <span className="font-semibold">regardless of</span> this field&apos;s value.
      </li>
      <li>
        If you have not set a score in a test case, the score of passing Valgrind is equal to this field&apos;s value.
      </li>
    </ul>
  </InfoTooltip>
));
ScoreTooltip.displayName = "ScoreTooltip";

export default ValgrindSettings;
