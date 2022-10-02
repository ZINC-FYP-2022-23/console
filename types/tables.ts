/**
 * @file Types for the database tables.
 */

export type Assignment = {
  configs: AssignmentConfig[];
  course: Course;
  course_id: number;
  createdAt: string;
  deletedAt?: string;
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
  assignment: Assignment;
  assignment_id: number;
  attemptLimits?: number;
  configValidated: boolean;
  config_yaml: string;
  createdAt: string;
  deletedAt?: string;
  dueAt: string;
  gradeImmediately: boolean;
  id: number;
  openForSubmission: boolean;
  releaseGradeAt?: string;
  showAt: string;
  showImmediateScores: boolean;
  startCollectionAt: string;
  stopCollectionAt: string;
  submissionWindowPassed: boolean;
  updatedAt: string;
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

export type Course = {
  assignments: Assignment[];
  code: string;
  created_at: string;
  deleted_at?: string;
  id: number;
  is_shown: boolean;
  name: string;
  sections: Section[];
  semester: Semester;
  semester_id: number;
  updated_at: string;
  users: User[];
  website?: string;
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
  details: GradeDetail;
  maxTotal: number;
  isSuccess: boolean;
  gradedTotal: number;
  hasTimedOut: boolean;
};

export type GradeDetail = {
  reports: PipelineReport[];
  accScore: number;
  accTotal: number;
};

export type PipelineReport = {
  hash: string;
  score: number;
  total: number;
  displayName: string;
  stageReportPath: string;
  stageMangledName: string;
  testCaseReportPath: string;
  testCaseMangledName: string;
};

export type PipelineResult = {
  configError?: string;
  contextError?: string;
  scoreReports: GradeDetail;
  // TODO: Typing on stage reports
  stageReports: object;
};

export type Report = {
  createdAt: string;
  grade: Grade;
  id: number;
  initiatedBy: User;
  initiated_by: number;
  is_final: boolean;
  is_test: boolean;
  pipeline_results: PipelineResult;
  remarks: object;
  // TODO: Typing on stage reports (same as `PipelineResult.stageReports`)
  sanitizedReports: object;
  show_at: string;
  submission: Submission;
  submission_id: number;
  updatedAt: string;
};

export type Section = {
  course: Course;
  course_id: number;
  created_at: string;
  deleted_at?: string;
  id: number;
  name: string;
  updated_at: string;
  users: User[];
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
  deletedAt?: string;
  id: number;
  name?: string;
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
  extracted_path?: string;
  fail_reason?: string;
  id: number;
  isLate: boolean;
  remarks?: object;
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
  name: String;
  sections: SectionUser[];
  submissions: Submission[];
  updatedAt: string;
};
