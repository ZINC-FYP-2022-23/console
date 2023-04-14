import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { ConfigDiagnostics, DiagnosticRaw } from "@/types/GuiBuilder";
import { configDiagnosticsFromRaw } from "../../GuiBuilder/diagnostics";

describe("GuiBuilder: Utils - Diagnostics", () => {
  test("configDiagnosticsFromRaw()", () => {
    const diagnosticsRaw: DiagnosticRaw[] = [
      {
        type: "LANG_FORMAT_ERROR",
        message: "field '_settings.lang' is invalid. Correct format: $lang[$/compiler]:$version",
        severity: "ERROR",
        location: { stage: "_settings" },
      },
      {
        type: "MISSING_FIELD_ERROR",
        message: "field '_settings.use_skeleton' is required but is missing. use_skeleton requires to be true",
        severity: "ERROR",
        location: { stage: "diffWithSkeleton" },
      },
      {
        type: "INVALID_FIELD_ERROR",
        message:
          "field '_settings.lang' is invalid. Your '_settings.lang' used cannot be resolved into a distro for executing this pipeline stage",
        severity: "ERROR",
        location: { stage: "compile:all" },
      },
      {
        type: "DUMMY_UNKNOWN_ERROR",
        message: "A dummy error of unknown origin",
        severity: "ERROR",
      },
    ];

    const expectedOutput: ConfigDiagnostics = {
      _settings: [{ ...diagnosticsRaw[0], resolved: false }],
      stages: {
        "stage-0": [{ ...diagnosticsRaw[1], resolved: false }],
        "stage-2": [{ ...diagnosticsRaw[2], resolved: false }],
      },
      others: [{ ...diagnosticsRaw[3], resolved: false }],
    };

    const model = getThreeStageModel();
    const actualOutput = configDiagnosticsFromRaw(diagnosticsRaw, model.config.editingConfig.stageData);
    expect(actualOutput).toEqual(expectedOutput);
  });
});
