/**
 * @file Scorable-related types, which are used in stage configs.
 *
 * Please read {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html} before diving into the
 * type definitions.
 */

/**
 * Scoring policies of {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html Scorable} stages.
 * - `total` - {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#total-based-scorable Total-Based Scorable}
 * - `perElement` - {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#per-element-scorable Per-Element Scorable}
 * - `weighted` - {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#weighted-scorable Weighted Scorable}
 * - `disabled` - The stage won't contribute to the final score.
 */
export type ScorablePolicy = "total" | "perElement" | "weighted" | "disable";

// #region Total-Based Scorable

export type DenormalPolicy = "IGNORE" | "FAILURE" | "SUCCESS";

// #endregion

// #region Weighted Scorable

/**
 * How to join multiple predicates in an {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#override Override}.
 */
export type JoinPolicy = "AND" | "OR";

/**
 * A score override by matching elements (e.g. test cases) by the predicates (supplied by `TPredicates`).
 *
 * See {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#override Override}.
 */
export type OverrideRaw<TPredicates extends Predicates = {}> = {
  score: number;
  joinPolicy?: JoinPolicy;
} & TPredicates;

/** A tidied version of {@link OverrideRaw}. */
export type Override<TPredicates extends Predicates = {}> = OverrideRaw<TPredicates> & {
  /**
   * A helper field that stores a random UUID generated during conversion from {@link OverrideRaw}.
   *
   * This is for identifying the override object in an array of overrides.
   */
  _uuid: string;
};

/**
 * The shape of {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#weighted-scorable Weighted Scorable}
 * returned by the back-end.
 */
export type ScoreWeightingRaw<TOverride extends OverrideRaw> = {
  default: number;
  limit?: number;
  overrides?: TOverride[];
};

export type ScoreWeighting<TOverride extends Override> = {
  default: number;
  limit?: number;
  overrides: TOverride[];
};

/**
 * The shape of a XUnit Weighted Scorable returned by the back-end
 * ({@link https://docs.zinc.ust.dev/user/pipeline/docker/XUnit.html#weighted-scorable Reference}).
 */
export type XUnitOverrideRaw = OverrideRaw<XUnitOverridePredicates>;
export type XUnitOverride = Override<XUnitOverridePredicates>;

// #endregion

// #region Predicates (used in Weighted Scorable)

/**
 * A predicate is used to match elements (e.g. test cases),
 *
 * See {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#predicates Predicates}.
 */
export type Predicate<TValue, TOp> = {
  value: TValue;
  op: TOp;
};

export type PredicateBoolean = Predicate<boolean, PredicateOpEqual>;
/**
 * Represents both `Predicate.Integral` and `Predicate.FP` as described in
 * {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#compareop the docs}.
 */
export type PredicateNumber = Predicate<number, PredicateOpCompare>;
export type PredicateString = Predicate<string, PredicateOpString>;

/** Supported types of {@link Predicate.value} in the form of string literals. */
export type PredicateSupportedValueTypes = "boolean" | "number" | "string";

export type PredicateOpEqual = "EQ" | "NOT_EQ";
export type PredicateOpCompare = "EQ" | "NOT_EQ" | "LT" | "LT_EQ" | "GT" | "GT_EQ";
export type PredicateOpString = "EQ" | "NOT_EQ" | "CASE_IGNORE_EQ" | "CASE_IGNORE_NOT_EQ" | "REGEX_EQ" | "REGEX_NOT_EQ";

/**
 * A collection of what predicate-related fields that can be found in an
 * {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#override Override} object.
 *
 * An example implementation is {@link XUnitOverridePredicates}.
 */
export type Predicates = Record<string, PredicateBoolean | PredicateNumber | PredicateString | undefined>;

/**
 * Predicates of a {@link https://docs.zinc.ust.dev/user/pipeline/docker/XUnit.html XUnit Weighted Scorable}'s
 * score override object.
 *
 * It's an implementation of the {@link Predicates} type.
 */
export type XUnitOverridePredicates = {
  className?: PredicateString;
  testName?: PredicateString;
  displayName?: PredicateString;
};

// #endregion
