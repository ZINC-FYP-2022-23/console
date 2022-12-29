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

export interface StdioTest {
  // TODO(Anson)
}

/////////////// HELPER TYPES ///////////////

export default StageConfig;
