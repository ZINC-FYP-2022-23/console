import { StageKind } from "@types";

export interface SupportedStage {
  /** Stage name (e.g. `"StdioTest"`, `"Compile"`). */
  readonly name: string;
  /** Label to be shown in the UI. */
  readonly label: string;
  /** Stage kind. */
  readonly kind: StageKind;
  /** Description to be shown in the UI. */
  readonly description: string;
}

/**
 * Pipeline stages supported by the GUI Assignment Builder.
 */
const supportedStages: SupportedStage[] = [
  {
    name: "Compile",
    label: "Compile",
    kind: StageKind.PRE_LOCAL,
    description: "Compiles source files to executable for grading",
  },
  {
    name: "DiffWithSkeleton",
    label: "Diff With Skeleton",
    kind: StageKind.PRE_GLOBAL,
    description: "Compares submission against skeleton file",
  },
  {
    name: "FileStructureValidation",
    label: "File Structure Validation",
    kind: StageKind.PRE_GLOBAL,
    description: "Checks if the submitted filename tree follows specification",
  },
  {
    name: "Score",
    label: "Score",
    kind: StageKind.POST,
    description: "Accumulates all scores from previous stages",
  },
  {
    name: "StdioTest",
    label: "Standard I/O Test",
    kind: StageKind.GRADING,
    description: "Grades submissions against standard input/output using test cases",
  },
];

export default supportedStages;
