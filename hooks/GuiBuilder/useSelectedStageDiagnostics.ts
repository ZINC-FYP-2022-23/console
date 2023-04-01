import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Diagnostic } from "@/types/GuiBuilder";

/**
 * Returns the diagnostics of the currently selected stage, and a function to resolve diagnostics
 * that match a predicate.
 *
 * @returns An array of two elements:
 * - Diagnostics of currently selected stage. It returns an empty array if no stage is selected or the
 * selected stage has no diagnostics.
 * - A function to resolve/un-resolve all diagnostics of the currently selected stage that match a predicate.
 * See {@link Diagnostic.resolved} for the semantics of "resolve". It does nothing if no stage is selected
 * or the selected stage has no diagnostics.
 *
 * @example
 * const [diagnostics, resolveDiagnostics] = useSelectedStageDiagnostics();
 *
 * const isMissingFieldError = (d: Diagnostic) => d.type === "MISSING_FIELD_ERROR";
 *
 * // Get all MISSING_FIELD_ERROR diagnostics of the currently selected stage
 * diagnostics.filter(isMissingFieldError);
 *
 * // Resolve all MISSING_FIELD_ERROR diagnostics of the currently selected stage
 * resolveDiagnostics(isMissingFieldError);
 */
export default function useSelectedStageDiagnostics() {
  const selectedStage = useStoreState((state) => state.pipelineEditor.selectedStage);
  const stagesDiagnostics = useStoreState((state) => state.config.diagnostics.stages);
  const updateDiagnostics = useStoreActions((actions) => actions.config.updateDiagnostics);

  const stagesDiagnosticsHasStageId = selectedStage && selectedStage.id in stagesDiagnostics;

  const diagnostics = stagesDiagnosticsHasStageId ? stagesDiagnostics[selectedStage.id] : [];

  const resolveFunction = (predicate: (diagnostic: Diagnostic) => boolean, resolveValue = true) => {
    if (stagesDiagnosticsHasStageId) {
      updateDiagnostics((diagnostics) => {
        const stageDiagnostics = diagnostics.stages[selectedStage.id];
        for (const diagnostic of stageDiagnostics) {
          if (predicate(diagnostic)) diagnostic.resolved = resolveValue;
        }
      });
    }
  };

  return [diagnostics, resolveFunction] as const;
}
