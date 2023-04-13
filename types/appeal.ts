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
  newFileSubmissionId?: number | string;
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
  originalState: ChangeLogState;
  updatedState: ChangeLogState;
  initiatedBy: number; // User ID
  reason?: string;
  appealId?: number;
  userId: number;
  assignmentConfigId: number;
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

// Unique types in student-ui
export type AppealLog = {
  id: number;
  type: ChangeLogTypes | "APPEAL_SUBMISSION";
  date: string;
  originalState?: ChangeLogState;
  updatedState?: ChangeLogState;
  reason?: string;
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
