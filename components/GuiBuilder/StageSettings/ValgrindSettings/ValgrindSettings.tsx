import { MultiSelect, NumberInput, Select, SwitchGroup, Textarea } from "@/components/Input";
import { defaultValgrindConfig } from "@/constants/GuiBuilder/defaults";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { useSelectedStageConfig, useSelectedStageDiagnostics } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { memo } from "react";
import { Alert, InfoTooltip } from "../../Diagnostics";
import { checksFilterOptions, visibilityOptions } from "./inputOptions";
import { Diagnostic } from "@/types/GuiBuilder";

function ValgrindSettings() {
  const [config, setConfig] = useSelectedStageConfig("Valgrind");
  const hasStdioTestStage = useStoreState((state) => state.config.hasStage("StdioTest"));

  if (!config) return null;

  return (
    <div className="p-3 flex flex-col gap-4">
      {!hasStdioTestStage && <MissingStdioTestAlert />}
      <SwitchGroup
        id="enabled"
        label='Run Valgrind on all test cases in "Standard I/O Test" stage'
        checked={config.enabled}
        onChange={(value) => setConfig({ ...config, enabled: value })}
      />
      <div className="flex items-center gap-3">
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
      <div className="flex items-center gap-3">
        <label htmlFor="visibility" className="flex-1">
          Visibility to students
        </label>
        <Select
          id="visibility"
          data={visibilityOptions}
          value={config.visibility ?? defaultValgrindConfig.visibility}
          onChange={(value) => {
            if (!value) return;
            setConfig({ ...config, visibility: value });
          }}
          className="flex-[2]"
          maxDropdownHeight={320}
        />
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="checksFilter" className="flex-1">
          Errors to check
        </label>
        <div className="flex-[2]">
          <MultiSelect
            id="checksFilter"
            data={checksFilterOptions}
            value={config.checksFilter ?? defaultValgrindConfig.checksFilter}
            onChange={(value) => setConfig({ ...config, checksFilter: value })}
            placeholder="Select errors..."
          />
        </div>
      </div>
      <div className="flex gap-3">
        <label htmlFor="args" className="mt-2 flex-1">
          Valgrind command-line options
        </label>
        <Textarea
          id="args"
          value={config.args ?? ""}
          onChange={(e) => setConfig({ ...config, args: e.target.value })}
          placeholder="e.g. --leak-check=full"
          monospace
          styles={{ root: { flex: 2 } }}
        />
      </div>
    </div>
  );
}

/**
 * Alert to show when the pipeline is missing a `StdioTest` stage, since Valgrind depends on it.
 */
function MissingStdioTestAlert() {
  const [diagnostics, resolveDiagnostics] = useSelectedStageDiagnostics();
  const setAddStageSearchString = useStoreActions((actions) => actions.layout.setAddStageSearchString);

  const isMissingStdioTestError = (d: Diagnostic) => d.type === "MISSING_FIELD_ERROR" && d.field === "stdioTest";
  const hasMissingStdioTestError = diagnostics.some(isMissingStdioTestError);

  return (
    <Alert severity={hasMissingStdioTestError ? "error" : "warning"} data-cy="missing-stdiotest-alert">
      <p>
        This stage depends on a{" "}
        <button
          className="text-blue-700 underline"
          onClick={() => {
            resolveDiagnostics(isMissingStdioTestError);
            setAddStageSearchString(supportedStages.StdioTest.nameInUI);
          }}
        >
          Standard I/O Test stage
        </button>
        . Please add it back to your pipeline.
      </p>
    </Alert>
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
