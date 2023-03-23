/**
 * @file Types related to config diagnostics.
 */
import { Config, Settings } from "@/types/GuiBuilder";

/**
 * The raw shape of a diagnostic that describes a problem in the config YAML.
 *
 * After the Grader validates the config YAML, it returns a list `DiagnosticRaw` objects in the payload that
 * describes any problems found. This list will be processed and converted to {@link ConfigDiagnostics}.
 */
export interface DiagnosticRaw {
  type: string;
  message: string;
  severity: "WARNING" | "ERROR";
  location?: {
    /** Key of the stage (e.g. `"compile:main"`, `"diffWithSkeleton"`). */
    stage?: string;
    testCaseId?: number;
  };
}

/**
 * Diagnostics found in the {@link Config} after validation by the Grader.
 */
export interface ConfigDiagnostics {
  /** Diagnostics related to {@link Settings}, i.e. the `_settings` block of the YAML. */
  _settings: Diagnostic[];
  /** A map of a stage's UUID to its corresponding diagnostics. */
  stages: { [stageId: string]: Diagnostic[] };
  /** Diagnostics of unknown origin are placed here as a fallback. */
  others: Diagnostic[];
}

/**
 * A diagnostic that describes a problem in the config YAML.
 */
export interface Diagnostic {
  /** An ID to identify the type of the diagnostic. */
  type: string;
  /** Human readable message. */
  message: string;
  /** Diagnostic severity. */
  severity: "WARNING" | "ERROR";
  /** Location of the diagnostic if any. */
  location?: {
    /** Test case ID. */
    testCaseId?: number;
  };
}
