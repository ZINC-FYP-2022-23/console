/**
 * @file Types for appeal-related components and pages.
 */

// Common types used in both console and student-ui
export enum AppealStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}

export type AppealAttempt = {
  id: number;
  newFileSubmissionId?: number;
  assignmentConfigId: number;
  userId: number;
  createdAt: string;
  status: AppealStatus;
  updatedAt: string;
  reportId?: number;
};

export enum ChangeLogTypes {
  APPEAL_STATUS = "APPEAL_STATUS",
  SCORE = "SCORE",
  SUBMISSION = "SUBMISSION",
}

export type ChangeLogState =
  | { type: "score"; score: number }
  | { type: "status"; status: "ACCEPTED" | "REJECTED" | "PENDING" }
  | { type: "submission"; submission: number };

export type AppealLog = {
  id: number;
  type: ChangeLogTypes | "APPEAL_SUBMISSION";
  date: string;
  originalState?: ChangeLogState;
  updatedState?: ChangeLogState;
  reason?: string;
  newFileSubmissionId?: number;
  reportId?: number;
};

/**
 * Data returned by the webhook `/diffSubmissions` endpoint, which compares two assignment submissions.
 */
export type DiffSubmissionsData = {
  /** Diff output between the old submission and the new submission. */
  diff: string;
  /** Error message if any. */
  error: string | null;
  /** HTTP status of the API call. */
  status: number;
};

export type DisplayMessageType = {
  id: number;
  content: string;
  name: string;
  type: "Student" | "Teaching Assistant";
  time: string;
};

export type DisplayedAppealInfo = {
  id: number;
  name: string;
  itsc: string;
  status: AppealStatus;
  updatedAt: string;
  originalScore: number;
};
