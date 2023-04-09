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
  /** An ID to identify the type of the diagnostic (e.g. `"MISSING_FIELD_ERROR"`). */
  type: string;
  /**
   * Human readable message of the diagnostic.
   *
   * It may not be suitable to directly display this message in the UI. This is because it may contain the
   * key name of the erroneous YAML field, which may confuse the users if shown to them.
   */
  message: string;
  /** Diagnostic severity. */
  severity: "WARNING" | "ERROR";
  /** Additional details. */
  details?: string;
  /** List of YAML fields that causes the diagnostic. */
  fields?: string[];
  /** Location of the diagnostic if any. */
  location?: {
    /** Key of the stage (e.g. `"compile:main"`, `"diffWithSkeleton"`). */
    stage?: string;
    /** Test case ID. Relevant to certain stages such as `StdioTest`. */
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
export interface Diagnostic extends DiagnosticRaw {
  /**
   * A helper field to indicate whether this diagnostic is resolved.
   *
   * A diagnostic can be resolved if the user has fixed the problem or has chosen to ignore it. Once it's
   * marked resolved, the UI should hide the diagnostic.
   */
  resolved: boolean;
}
