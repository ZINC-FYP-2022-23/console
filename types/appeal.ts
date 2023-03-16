/**
 * @file Types for appeal-related components and pages.
 */

// Common types used in both console and student-ui
export enum AppealStatus {
  Accept = "Accepted",
  Reject = "Rejected",
  Pending = "Pending",
}

export type AppealAttempt = {
  id: number;
  newFileSubmissionId?: string;
  assignmentConfigId: number;
  userId: number;
  createdAt: string;
  latestStatus: AppealStatus;
  updatedAt: string;
};

export type AppealMessage = {
  id: number;
  message: string;
  createdAt: string;
  senderId: number;
  attemptId: number;
  isRead: boolean;
};

export type ChangeLog = {
  id: number;
  createdAt: string;
  type: ChangeLogTypes;
  originalState: string;
  updatedState: string;
  initiatedBy: number; // User ID
  reason?: string;

  appealId?: number;
};

export enum ChangeLogTypes {
  APPEAL_STATUS,
  SCORE,
  SUBMISSION,
}

// Unique types in student-ui
export type AppealLog = {
  id: number;
  type: ChangeLogTypes | "APPEAL_SUBMISSION";
  date: string;
  originalState?: string;
  updatedState?: string;
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
