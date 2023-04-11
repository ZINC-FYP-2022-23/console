/**
 * Grade appeal policies of an assignment.
 */
interface GradeAppealPolicy {
  /** Whether to allow grade appeals after releasing grades. */
  isAppealAllowed: boolean;
  /** Maximum number of times a student can appeal. `null` means unlimited attemps. */
  appealLimits: number | null;
  /** When to start appeal collection. It's a date string in ISO format.  */
  appealStartAt: string | null;
  /** When to stop appeal collection. It's a date string in ISO format.  */
  appealStopAt: string | null;
  /** Whether studetns are allowed to send reply messages after submitting an appeal. */
  isAppealStudentReplyAllowed: boolean;
  /** Whether students are allowed to view the appeal report. */
  isAppealViewReportAllowed: boolean;
}

export default GradeAppealPolicy;
