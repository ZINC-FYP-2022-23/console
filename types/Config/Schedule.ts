/**
 * Date and time settings for an assignment.
 *
 * All fields are `string` in ISO format instead of `Date` because the Easy Peasy store (which uses Redux under
 * the hood) does not support serializing `Date` objects. See {@link https://github.com/reduxjs/redux-toolkit/issues/456}
 */
interface Schedule {
  /** When to announce the assignment. */
  showAt: string;
  /** When to start collection. */
  startCollectionAt: string;
  /** When the assignment is due. This field should not be an empty string. */
  dueAt: string;
  /** When to stop collecting assignments. This field should not be an empty string. */
  stopCollectionAt: string;
  /**
   * When to release the grade. Only applicable if grading details are not revealed immediately,
   * i.e. `GradingPolicy.showImmediateScores` is false.
   */
  releaseGradeAt: string;
}

export default Schedule;
