import { ChangeLog, Submission as SubmissionType } from "@/types/tables";
import {
  AppealAttempt,
  AppealLog,
  DisplayMessageType,
  ChangeLogTypes,
  AppealStatus,
  ChangeLogState,
} from "@/types/appeal";

/**
 * Transform the raw data appeal status into type `AppealStatus`
 * @param originalStatus - The status to be transformed
 * @returns {AppealStatus}
 */
export function transformAppealStatus(originalStatus: string): AppealStatus {
  let transformedStatus: AppealStatus;
  switch (originalStatus) {
    case "ACCEPTED":
      transformedStatus = AppealStatus.ACCEPTED;
      break;
    case "PENDING":
      transformedStatus = AppealStatus.PENDING;
      break;
    case "REJECTED":
      transformedStatus = AppealStatus.REJECTED;
      break;
    default:
      transformedStatus = AppealStatus.PENDING;
  }

  return transformedStatus;
}

interface transformToAppealAttemptProps {
  /** Raw Data of a list of appeal attempts */
  appealsDetailsData;
}

/**
 * Transform raw data into a list of `AppealAttempt`
 * @returns {AppealAttempt[]} - A list of `AppealAttempt`s
 */
export function transformToAppealAttempt({ appealsDetailsData }: transformToAppealAttemptProps) {
  let appealAttempts: AppealAttempt[] = [];

  // Case: Only 1 appeal attempt
  if (appealsDetailsData.appeal) {
    let latestStatus: AppealStatus = transformAppealStatus(appealsDetailsData.appeal.status);

    appealAttempts.push({
      id: appealsDetailsData.appeal.id,
      newFileSubmissionId: appealsDetailsData.appeal.newFileSubmissionId || null,
      assignmentConfigId: appealsDetailsData.appeal.assignmentConfigId,
      userId: appealsDetailsData.appeal.userId,
      createdAt: appealsDetailsData.appeal.createdAt,
      latestStatus: latestStatus,
      updatedAt: appealsDetailsData.appeal.updatedAt,
    });
  }

  // Case: >1 appeal attempts
  if (appealsDetailsData.appeals) {
    appealsDetailsData.appeals.forEach((appeal) => {
      let latestStatus: AppealStatus = transformAppealStatus(appeal.status);

      appealAttempts.push({
        id: appeal.id,
        newFileSubmissionId: appeal.newFileSubmissionId || null,
        assignmentConfigId: appeal.assignmentConfigId,
        userId: appeal.userId,
        createdAt: appeal.createdAt,
        latestStatus: latestStatus,
        updatedAt: appeal.updatedAt,
      });
    });
  }

  return appealAttempts;
}

interface sortProps {
  /** List of submission-related logs */
  submissions?: SubmissionType[];
  /** List of appeal messages */
  messages?: DisplayMessageType[];
  /** List of appeal-related logs */
  appealLog: AppealLog[];
}

/**
 * This combines 2~3 lists and sort them from newest to oldest
 * @returns A list that also specifies each item's type
 */
function sort({ submissions, messages, appealLog }: sortProps) {
  let allLog: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[] = [];

  if (messages) allLog = allLog.concat(messages.map((m) => ({ ...m, _type: "appealMessage" })));
  if (appealLog) allLog = allLog.concat(appealLog.map((a) => ({ ...a, _type: "appealLog" })));
  if (submissions) allLog = allLog.concat(submissions.map((s) => ({ ...s, _type: "submission" })));

  allLog = allLog.sort((a, b) => {
    const getDate = (
      x:
        | (SubmissionType & { _type: "submission" })
        | (DisplayMessageType & { _type: "appealMessage" })
        | (AppealLog & { _type: "appealLog" }),
    ) => {
      if (x._type === "appealMessage") return new Date(x.time);
      else if (x._type === "submission") return new Date(x.created_at);
      else return new Date(x.date);
    };

    let aDate: Date = getDate(a);
    let bDate: Date = getDate(b);

    if (aDate > bDate) {
      return -1;
    } else if (aDate < bDate) {
      return 1;
    } else {
      return 0;
    }
  });

  return allLog;
}

interface transformStateType {
  type: ChangeLogTypes | "APPEAL_SUBMISSION"; // Type of the log
  state: ChangeLogState; // JSON string to be transformed
}

/**
 * Transforms a JSON object of type ChangeLogState
 * @returns {AppealStatus | string} - The new transformed state
 */
function transformState({ type, state }: transformStateType) {
  if (type === ChangeLogTypes.APPEAL_STATUS && state.type === "status") {
    if (state.status === "ACCEPTED") {
      return AppealStatus.ACCEPTED;
    } else if (state.status === "REJECTED") {
      return AppealStatus.REJECTED;
    } else if (state.status === "PENDING") {
      return AppealStatus.PENDING;
    }
  }

  if (type === ChangeLogTypes.SCORE && state.type === "score") {
    return state.score;
  }

  return state;
}

interface transformToAppealLogProps {
  appeals: AppealAttempt[]; // List of appeal attempts
  changeLog: ChangeLog[]; // List of change logs related to appeals
}

/**
 * Transforms and merges a list of `AppealAttempt` and `ChangeLog` into one list of `AppealLog`
 * @returns {AppealLog[]} - List of transformed and merged appeal logs, ordered from newest to oldest
 */
function transformToAppealLog({ appeals, changeLog }: transformToAppealLogProps): AppealLog[] {
  let appealLog: AppealLog[] = [];

  appeals.forEach((appeal) => {
    appealLog.push({
      id: appeal.id,
      type: "APPEAL_SUBMISSION",
      date: appeal.createdAt,
    });
  });

  changeLog.forEach((log) => {
    appealLog.push({
      id: log.id,
      // @ts-ignore
      type: log.type,
      date: log.createdAt,
      originalState: log.originalState,
      updatedState: log.updatedState,
      reason: log.reason,
    });
  });

  appealLog = appealLog.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    } else if (a.date < b.date) {
      return 1;
    } else {
      return 0;
    }
  });

  return appealLog;
}

interface mergeDataToActivityLogListProps {
  appealAttempt: AppealAttempt[]; // Raw data of a list of appeals
  appealChangeLogData; // Raw data of a list of change logs related to the appeals
  appealMessagesData?; // Raw data of a list of appeal messages related to the appeals
  submissionData?; // Raw data of the submission
}

/**
 * Merges appeal
 * @returns {(
 * | (SubmissionType & { _type: "submission" }
 * | (DisplayMessageType & { _type: "appealMessage" })
 * | (AppealLog & { _type: "appealLog" })
 * )[]} - List of transformed and merged appeal logs, ordered from newest to oldest
 */
export function mergeDataToActivityLogList({
  appealAttempt,
  appealChangeLogData,
  appealMessagesData,
  submissionData,
}: mergeDataToActivityLogListProps) {
  // Translate `appealChangeLogData` to `ChangeLog[]`
  let changeLogs: ChangeLog[] = [];
  appealChangeLogData.changeLogs.forEach((log) => {
    // Assign a log type for each change log
    let logType: ChangeLogTypes;
    if (log.type === "APPEAL_STATUS") logType = ChangeLogTypes.APPEAL_STATUS;
    else if (log.type === "SCORE") logType = ChangeLogTypes.SCORE;
    else logType = ChangeLogTypes.SUBMISSION;

    changeLogs.push({
      id: log.id,
      createdAt: log.createdAt,
      type: logType,
      originalState: log.originalState,
      updatedState: log.updatedState,
      initiatedBy: log.initiatedBy,
      reason: log.reason,
      appealId: log.appealId || null,
      userId: log.userId,
      assignmentConfigId: log.assignmentConfigId,
      reportId: log.reportId,
      submissionId: log.submissionId,
      user: log.user,
    });
  });

  // Translate `appealMessagesData` to `DisplayMessageType[]`
  let messages: DisplayMessageType[] = [];
  if (appealMessagesData) {
    appealMessagesData.appealMessages.forEach((message) => {
      // Assign a user type for each message
      let userType: "Student" | "Teaching Assistant";
      if (message.user.hasTeachingRole) userType = "Teaching Assistant";
      else userType = "Student";

      messages.push({
        id: message.id,
        content: message.message,
        name: message.user.name,
        type: userType,
        time: message.createdAt,
      });
    });
  }

  // Transform and sort the lists
  let log: AppealLog[] = transformToAppealLog({ appeals: appealAttempt, changeLog: changeLogs });
  let activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[] = sort({
    messages: messages,
    appealLog: log,
    submissions: submissionData?.submissions,
  });

  return activityLogList;
}

// Check whether RichTextEditor HTML string will render to become whitespace
// Reference: https://stackoverflow.com/questions/44675983/how-to-detect-whether-html-content-when-rendered-is-blank-whitespace
export function isInputEmpty(html: string) {
  const visible = ["img", "iframe", "object", "hr", "audio", "video", "form", "button", "input", "select", "textarea"];
  const container = document.createElement("div");
  container.innerHTML = html;
  return !(container.innerText.trim().length > 0 || container.querySelector(visible.join(",")));
}
