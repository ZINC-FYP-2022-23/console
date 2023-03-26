/**
 * @file Types for the database tables.
 */

import { NumberInputStylesNames } from "@mantine/core";
import { GraderReport, ScoreReports } from "./report";

export type AppealMessage = {
  id: number;
  message: string;
  senderId: number;
  appealId: number;
  createdAt: string;
  isRead: boolean;
  assignment_appeal: Appeal;
  user: User;
};

export type Appeal = {
  id: number;
  createdAt: string;
  status: string;
  newFileSubmissionId: number | null;
  updatedAt: string | null;
  userId: number;
  assignmentConfigId: number;
  assignment_appeal_messages: AppealMessage[];
  assignment_config: AssignmentConfig;
  submission: Submission;
  user: User;
};

export type Assignment = {
  configs: AssignmentConfig[];
  course: Course;
  course_id: number;
  createdAt: string;
  deletedAt: string | null;
  description: string;
  description_html: string;
  id: number;
  name: string;
  showAt: string;
  type: number;
  updatedAt: string;
  workloadType: AssignmentType;
};

export type AssignmentConfig = {
  affected_users: AssignmentConfigUser[];
  assignment: Assignment;
  assignment_id: number;
  attemptLimits: number | null;
  configValidated: boolean;
  config_yaml: string;
  createdAt: string;
  deletedAt: string | null;
  dueAt: string;
  gradeImmediately: boolean;
  id: number;
  /** Whether the current time is after `startCollectionAt`. It equals to false if `startCollectionAt` is null. */
  openForSubmission: boolean;
  releaseGradeAt: string | null;
  showAt: string | null;
  showImmediateScores: boolean;
  startCollectionAt: string | null;
  stopCollectionAt: string;
  /** Whether the current time is after `stopCollectionAt`. */
  submissionWindowPassed: boolean;
  updatedAt: string;
  /** Appeal-related */
  isAppealAllowed: boolean;
  appealLimits: number | null;
  appealStartAt: Date | null;
  appealStopAt: Date | null;
  isAppealStudentReplyAllowed: boolean;
  isAppealViewReportAllowed: boolean;
  assignment_appeals: Appeal[];
};

export type AssignmentConfigUser = {
  assignment_config: AssignmentConfig;
  assignment_config_id: number;
  createdAt: string;
  id: number;
  updatedAt: string;
  user: User;
  user_id: number;
};

export type AssignmentType = {
  assignments: Assignment[];
  created_at: string;
  id: number;
  name: string;
  updated_at: string;
};

export type ChangeLog = {
  id: number;
  createdAt: string;
  type: string;
  originalState: string;
  updatedState: string;
  initiated_by: number;
  reason: string;
  appealId: number;
  userId: number;
  assignmentConfigId: number;
  reportId: number;
  submissionId: number;
  user: User;
};

export type Course = {
  assignments: Assignment[];
  code: string;
  created_at: string;
  deleted_at: string | null;
  id: number;
  is_shown: boolean;
  name: string;
  sections: Section[];
  semester: Semester;
  semester_id: number;
  updated_at: string;
  users: User[];
  website: string | null;
};

export type CourseUser = {
  course: Course;
  course_id: number;
  created_at: string;
  id: number;
  permission: number;
  role: CourseUserRole;
  updated_at: string;
  user: User;
  user_id: number;
};

export type CourseUserRole = "Student" | "Teaching Staff";

export type Grade = {
  score: number;
  details: ScoreReports;
  maxTotal: number;
  isSuccess: boolean;
  gradedTotal: number;
  hasTimedOut: boolean;
};

export type Report = {
  createdAt: string;
  grade: Grade;
  id: number;
  initiatedBy: User;
  initiated_by: number;
  is_final: boolean;
  is_test: boolean;
  pipeline_results: GraderReport;
  remarks: object;
  // TODO: Typing on stage reports (same as `PipelineResult.stageReports`)
  sanitizedReports: any;
  show_at: string;
  submission: Submission;
  submission_id: number;
  updatedAt: string;
};

export type Section = {
  course: Course;
  course_id: number;
  created_at: string;
  deleted_at: string | null;
  id: number;
  name: string;
  updated_at: string;
  users: SectionUser[];
};

export type SectionUser = {
  create_at: string;
  id: number;
  section: Section;
  section_id: number;
  updated_at: string;
  user: User;
  user_id: number;
};

export type Semester = {
  createdAt: string;
  deletedAt: string | null;
  id: number;
  name: string | null;
  term: SemesterTerm;
  updatedAt: string;
  year: number;
};

export type SemesterTerm = "FALL" | "WINTER" | "SPRING" | "SUMMER" | "UNKNOWN";

export type Submission = {
  assignment_config: AssignmentConfig;
  assignment_config_id: number;
  checksum: string;
  created_at: string;
  extracted_path: string | null;
  fail_reason: string | null;
  id: number;
  isLate: boolean;
  remarks: object | null;
  reports: Report[];
  size: number;
  stored_name: string;
  updatedAt: string;
  upload_name: string;
  user: User;
  user_id: number;
};

export type User = {
  assignedTasks: AssignmentConfigUser[];
  courses: CourseUser[];
  createdAt: string;
  hasTeachingRole: boolean;
  id: number;
  initials: string;
  isAdmin: boolean;
  itsc: string;
  name: string;
  sections: SectionUser[];
  submissions: Submission[];
  updatedAt: string;
  change_logs: ChangeLog[];
};
