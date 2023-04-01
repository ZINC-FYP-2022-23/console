/**
 * @file Utilities related to config diagnostics.
 */

import { ConfigDiagnostics, Diagnostic, DiagnosticRaw, StageDataMap } from "@/types/GuiBuilder";
import { getStageKey } from "./stage";

/**
 * Parses a list of raw diagnostics into a {@link ConfigDiagnostics} object.
 * @param diagnosticsRaw Raw config diagnostics obtained from the Grader's `ValidateConfig` payload.
 * This list will NOT be mutated.
 * @param stageData We need the stage data to determine the stage's UUID from its key.
 */
export function configDiagnosticsFromRaw(diagnosticsRaw: DiagnosticRaw[], stageData: StageDataMap) {
  const configDiagnostics: ConfigDiagnostics = {
    _settings: [],
    stages: {},
    others: [],
  };

  for (const diagnosticRaw of diagnosticsRaw) {
    const diagnostic: Diagnostic = { ...diagnosticRaw, resolved: false };

    const diagnosticStage = diagnosticRaw.location?.stage;
    if (diagnosticStage === undefined) {
      configDiagnostics.others.push(diagnostic);
    } else if (diagnosticStage === "_settings") {
      configDiagnostics._settings.push(diagnostic);
    } else {
      // Search the stage with stage key matching `diagnosticStage`
      let hasMatchingStage = false;
      for (const [stageId, stage] of Object.entries(stageData)) {
        const stageKey = getStageKey(stage.name, stage.label);
        if (diagnosticStage === stageKey) {
          if (stageId in configDiagnostics.stages) {
            configDiagnostics.stages[stageId].push(diagnostic);
          } else {
            configDiagnostics.stages[stageId] = [diagnostic];
          }

          hasMatchingStage = true;
          break;
        }
      }
      if (!hasMatchingStage) {
        configDiagnostics.others.push(diagnostic);
      }
    }
  }

  return configDiagnostics;
}
