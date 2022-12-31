/**
 * Configuration of each stage. The key is the stage name and the value is the configuration of the stage.
 */
interface StageConfig {
  Compile: Compile;
  DiffWithSkeleton: DiffWithSkeleton;
  FileStructureValidation: FileStructureValidation;
  Score: Score;
  StdioTest: StdioTest;
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

/**
 * The shape of `Score` stage's config returned by the backend
 * ({@link https://docs.zinc.ust.dev/user/pipeline/local/Score.html#config Reference}).
 */
export interface ScoreRaw {
  normalizedTo?: number;
  minScore?: number;
  maxScore?: number;
}

export interface Score {
  normalizedTo: string;
  minScore: string;
  maxScore: string;
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
  testCases: TestCaseRaw[];
  diff_ignore_flags: DiffIgnoreFlag[];
  additional_packages: string[];
  additional_pip_packages: string[];
}

export interface Valgrind {
  enabled?: boolean;
  args?: string[];
  checksFilter?: ChecksFilter[];
  visibility?: Visibility;
  score?: number;
}

/////////////// HELPER TYPES ///////////////

export type ChecksFilter = "*" | "Leak_*" | "Uninit*" | "*Free";

export type DiffIgnoreFlag = "TRAILING_WHITESPACE" | "SPACE_CHANGE" | "ALL_SPACE" | "BLANK_LINES";

export type HiddenItem = "STDIN" | "STDOUT" | "STDERR" | "DIFF";

export interface TestCaseRaw {
  id: number;
  file: string;
  visibility: Visibility;
  args?: string[];
  stdin?: string;
  file_stdin?: string;
  expected?: string;
  file_expected?: string;
  hide_from_report?: HiddenItem[];
  score?: number;
  valgrind?: Valgrind;
}

export type Visibility =
  | "ALWAYS_VISIBLE"
  | "ALWAYS_HIDDEN"
  | "VISIBLE_AFTER_GRADING"
  | "VISIBLE_AFTER_GRADING_IF_FAILED";

export default StageConfig;
