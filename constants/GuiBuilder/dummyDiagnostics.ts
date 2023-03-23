/**
 * @file Dummy data for config diagnostics.
 *
 * TODO(Anson): Delete this file later.
 */

import { DiagnosticRaw } from "@/types/GuiBuilder";

export const dummyGeneralSettingsDiagnostics: DiagnosticRaw[] = [
  {
    type: "MISSING_VERSION",
    message: "The version of the language is not specified.",
    severity: "ERROR",
    location: {
      stage: "_settings",
    },
  },
];

export const dummyPipelineStagesDiagnostics: DiagnosticRaw[] = [
  {
    type: "MISSING_FIELD_ERROR",
    message: "Missing Field. _settings.use_skeleton. use_skeleton requires to be true",
    severity: "ERROR",
    location: {
      stage: "diffWithSkeleton",
    },
  },
  {
    type: "MISSING_FIELD_ERROR",
    message: "Missing Field. _settings.use_template. ",
    severity: "ERROR",
    location: {
      stage: "fileStructureValidation",
    },
  },
];
