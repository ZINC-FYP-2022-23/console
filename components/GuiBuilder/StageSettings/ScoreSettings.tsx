import { NumberInput } from "@/components/Input";
import { useSelectedStageConfig, useSelectedStageDiagnostics } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { Diagnostic, StageKind } from "@/types/GuiBuilder";
import { Alert } from "../Diagnostics";
import { useEffect } from "react";

/**
 * Predicate for filtering diagnostics that are caused by missing grading stage.
 */
const isNoGradingStageError = (d: Diagnostic) =>
  !d.resolved && d.type === "MISSING_FIELD_ERROR" && d.field === "<Grading Stage>";

function ScoreSettings() {
  const [config, setConfig] = useSelectedStageConfig("Score");
  const [diagnostics, resolveDiagnostics] = useSelectedStageDiagnostics();
  const stageData = useStoreState((state) => state.config.editingConfig.stageData);

  const hasGradingStage = Object.values(stageData).some((stage) => stage.kind === StageKind.GRADING);

  // Auto-resolve the "missing grading stage" diagnostic when a grading stage is added.
  useEffect(() => {
    if (hasGradingStage && diagnostics.some(isNoGradingStageError)) {
      resolveDiagnostics(isNoGradingStageError);
    }
  }, [diagnostics, hasGradingStage, resolveDiagnostics]);

  if (!config) return null;

  const isMinGreaterThanMax =
    config.minScore !== undefined && config.maxScore !== undefined && config.minScore > config.maxScore;

  return (
    <div className="p-3 space-y-6">
      {!hasGradingStage && <NoGradingStageAlert />}
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="normalizedTo">Normalize maximum score to</label>
          <ul className="mx-5 list-disc text-xs text-gray-500">
            <li>Usually for normalizing score to 100-based</li>
            <li>Leave blank to use the original maximum value</li>
          </ul>
        </div>
        <NumberInput
          id="normalizedTo"
          value={config.normalizedTo}
          onChange={(normalizedTo) => setConfig({ ...config, normalizedTo })}
          min={0}
          placeholder="No normalization"
          className="flex-1"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <p>Limit the final score within a range</p>
          <ul className="mx-5 list-disc text-xs text-gray-500">
            <li>Set score to Min if score &lt; Min</li>
            <li>Set score to Max if score &gt; Max</li>
            <li>Leave the input(s) blank to disable clipping</li>
          </ul>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="minScore" className="w-8 text-gray-500 text-sm">
              Min:
            </label>
            <NumberInput
              id="minScore"
              value={config.minScore}
              onChange={(minScore) => setConfig({ ...config, minScore })}
              placeholder="No minimum limit"
              alertLevel={isMinGreaterThanMax ? "error" : undefined}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="maxScore" className="w-8 text-gray-500 text-sm">
              Max:
            </label>
            <NumberInput
              id="maxScore"
              value={config.maxScore}
              onChange={(maxScore) => setConfig({ ...config, maxScore })}
              placeholder="No minimum limit"
              alertLevel={isMinGreaterThanMax ? "error" : undefined}
              className="flex-1"
            />
          </div>
          {isMinGreaterThanMax && (
            <p className="ml-10 text-sm text-red-500 font-medium">Min value should be smaller than Max value</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Alert to show when the pipeline is missing a grading stage, since the Score stage depends on
 * a grading stage.
 */
function NoGradingStageAlert() {
  const [diagnostics] = useSelectedStageDiagnostics();
  const hasNoGradingStageError = diagnostics.some(isNoGradingStageError);

  return (
    <Alert severity={hasNoGradingStageError ? "error" : "warning"} data-cy="no-grading-stage-alert">
      <p>
        This stage depends on a <span className="font-semibold">Grading</span> stage in the pipeline. Please add a stage
        from the &quot;Grading&quot; category in the Add New Stage panel.
      </p>
    </Alert>
  );
}

export default ScoreSettings;
