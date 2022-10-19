/**
 * Grading policy of the assignment.
 */
interface GradingPolicy {
  /** Upper limit of attempts. A value of `null` means unlimited attempts. */
  attemptLimits: number | null;
  /** Whether to trigger grading on submission. */
  gradeImmediately: boolean;
  /** Whether to disclose scores to students once finished grading. */
  showImmediateScores: boolean;
}

export default GradingPolicy;
