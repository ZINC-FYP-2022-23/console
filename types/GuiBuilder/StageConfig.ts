/**
 * Configuration of each stage. The key is the stage name and the value is the configuration of the stage.
 */
interface StageConfig {
  Compile: Compile;
  DiffWithSkeleton: DiffWithSkeleton;
  FileStructureValidation: FileStructureValidation;
  Score: Score;
  StdioTest: StdioTest;
  Valgrind: Valgrind;
}

/////////////// STAGE CONFIG TYPES ///////////////

/**
 * The shape of `Compile` stage's config returned by the backend
 * ({@link https://docs.zinc.ust.dev/user/pipeline/docker/Compile.html#config Reference}).
 */
export interface CompileRaw {
  input: string[];
  output?: string;
  flags?: string[];
  additional_packages?: string[];
}

export interface Compile {
  input: string[];
  output?: string;
  flags?: string;
  additional_packages: string[];
}

export interface DiffWithSkeleton {
  exclude_from_provided: boolean;
}

export interface FileStructureValidation {
  ignore_in_submission?: string[];
}

export interface Score {
  normalizedTo?: number;
  minScore?: number;
  maxScore?: number;
}

/**
 * The shape of `StdioTest` stage's config returned by the backend
 * ({@link https://docs.zinc.ust.dev/user/pipeline/docker/StdioTest.html#config Reference}).
 */
export interface StdioTestRaw {
  testCases: TestCaseRaw[];
  diff_ignore_flags?: DiffIgnoreFlag[];
  additional_packages?: string[];
  additional_pip_packages?: string[];
}

export interface StdioTest {
  testCases: TestCase[];
  diff_ignore_flags: DiffIgnoreFlag[];
  additional_packages: string[];
  additional_pip_packages: string[];
}

export interface ValgrindRaw {
  enabled?: boolean;
  args?: string[];
  checksFilter?: ChecksFilter[];
  visibility?: VisibilityValgrind;
  score?: number;
}

export interface Valgrind {
  enabled: boolean;
  args?: string;
  checksFilter: ChecksFilter[];
  visibility: VisibilityValgrind;
  score?: number;
}

/////////////// HELPER TYPES ///////////////

export type ChecksFilter = "*" | "Leak_*" | "Uninit*" | "*Free";

export type DiffIgnoreFlag = "TRAILING_WHITESPACE" | "SPACE_CHANGE" | "ALL_SPACE" | "BLANK_LINES";

export type HiddenItem = "STDIN" | "STDOUT" | "STDERR" | "DIFF";

export interface TestCaseRaw {
  id: number;
  file: string;
  visibility: VisibilityTestCase;
  args?: string[];
  stdin?: string;
  file_stdin?: string;
  expected?: string;
  file_expected?: string;
  hide_from_report?: HiddenItem[];
  score?: number;
  valgrind?: ValgrindRaw;
}

export interface TestCase {
  id: number;
  file: string;
  visibility: VisibilityTestCase;
  args?: string;

  /** Helper field to indicate how standard input is specified. */
  _stdinInputMode: "text" | "file" | "none";
  stdin?: string;
  file_stdin?: string;

  /** Helper field to indicate how expected output is specified. */
  _expectedInputMode: "text" | "file" | "none";
  expected?: string;
  file_expected?: string;

  hide_from_report?: HiddenItem[];
  score?: number;

  /** Helper field to indicate whether to override setting from the Valgrind stage. */
  _valgrindOverride: boolean;
  valgrind?: Valgrind;
}

export type VisibilityTestCase =
  | "ALWAYS_VISIBLE"
  | "ALWAYS_HIDDEN"
  | "VISIBLE_AFTER_GRADING"
  | "VISIBLE_AFTER_GRADING_IF_FAILED";

export type VisibilityValgrind =
  | "ALWAYS_VISIBLE"
  | "ALWAYS_HIDDEN"
  | "VISIBLE_AFTER_GRADING"
  | "VISIBLE_AFTER_GRADING_IF_FAILED"
  | "INHERIT";

export default StageConfig;
