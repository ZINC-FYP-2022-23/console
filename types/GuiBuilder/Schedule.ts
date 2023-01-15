/**
 * Date and time settings for an assignment.
 *
 * All `string` fields are stored in ISO format.
 */
interface Schedule {
  /** When to announce the assignment. */
  showAt: string | null;
  /** When to start collection. */
  startCollectionAt: string | null;
  /** When the assignment is due. */
  dueAt: string;
  /** When to stop collecting assignments. */
  stopCollectionAt: string;
  /**
   * When to release the grade. Only applicable if grading details are not revealed immediately,
   * i.e. `GradingPolicy.showImmediateScores` is false.
   */
  releaseGradeAt: string | null;
}

export default Schedule;
