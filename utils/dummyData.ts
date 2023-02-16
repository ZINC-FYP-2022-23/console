import {
  AppealStatus,
  AppealAttempt,
  DisplayMessageType,
  ChangeLog,
  ChangeLogTypes,
  DisplayedAppealInfo,
  Grade,
  User,
} from "@/types";

// TODO(BRYAN): Remove the dummy data and replace with GraphQL codes
//The followings is dummy data for the student UI.

export const numAppealsLeft: number = 1;

export const appealStatus: AppealStatus = AppealStatus.Accept;

export const appeal: AppealAttempt | null = {
  id: 1,
  assignmentConfigAndUserId: 999,
  createdAt: "2022-12-20",
  latestStatus: AppealStatus.Reject,
  updatedAt: "2022-12-21",
};

export const messageList: DisplayMessageType[] = [
  {
    id: 1,
    name: "Lo Kwok Yan Bryan",
    type: "Student",
    time: "14 Nov 2022, 18:11",
    content: "Hi TA, I want to submit a grade appeal.",
  },
  {
    id: 2,
    name: "Gilbert Chan",
    type: "Teaching Assistant",
    time: "15 Nov 2022, 20:59",
    content: "Dear Bryan, Nice to Meet You!",
  },
  {
    id: 3,
    name: "Lo Kwok Yan Bryan",
    type: "Student",
    time: "14 Nov 2022, 18:11",
    content: "Hi TA, I want to submit a grade appeal.",
  },
  {
    id: 4,
    name: "Gilbert Chan",
    type: "Teaching Assistant",
    time: "15 Nov 2022, 20:59",
    content: "Okie, chekcing!",
  },
  {
    id: 5,
    name: "Lo Kwok Yan Bryan",
    type: "Student",
    time: "14 Nov 2022, 18:11",
    content: "Thank you.",
  },
  {
    id: 6,
    name: "Gilbert Chan",
    type: "Teaching Assistant",
    time: "15 Nov 2022, 20:59",
    content: "Still in process!",
  },
];

export const appealAttempts: AppealAttempt[] = [
  {
    id: 1001,
    assignmentConfigAndUserId: 999,
    createdAt: "2022-11-13",
    latestStatus: AppealStatus.Reject,
    updatedAt: "2022-11-14",
  },
  {
    id: 1002,
    assignmentConfigAndUserId: 999,
    createdAt: "2022-11-15",
    latestStatus: AppealStatus.Accept,
    updatedAt: "2022-11-16",
  },
];

export const changeLogList: ChangeLog[] = [
  {
    id: 2001,
    createdAt: "2022-11-14",
    type: ChangeLogTypes.APPEAL_STATUS,
    originalState: "[{'status':PENDING}]",
    updatedState: "[{'status':REJECTED}]",
    initiatedBy: 2,
  },
  {
    id: 2002,
    createdAt: "2022-11-15",
    type: ChangeLogTypes.APPEAL_STATUS,
    originalState: "[{'status':REJECTED}]",
    updatedState: "[{'status':ACCEPTED}]",
    initiatedBy: 2,
  },
  {
    id: 2003,
    createdAt: "2022-11-16",
    type: ChangeLogTypes.SCORE,
    originalState: "[{'score':80}]",
    updatedState: "[{'score':100}]",
    initiatedBy: 2,
  },
  {
    id: 2004,
    createdAt: "2022-11-17",
    type: ChangeLogTypes.SUBMISSION,
    originalState: "[{'submission':'old'}]",
    updatedState: "[{'submission':'new'}]",
    initiatedBy: 2,
  },
];

export const courseId = 3;

//const appealInfo: DisplayedAppealInfo | null = null;
export const appealInfo: DisplayedAppealInfo | null = {
  id: 2,
  name: "Peter Chan",
  itsc: "ptr",
  status: AppealStatus.Pending,
  updatedAt: "Today LOL",
  originalScore: 70,
};

export const fullScore: number = 100;

export const dummyAppealAttemptData: AppealAttempt[] = [
  {
    id: 2000,
    assignmentConfigAndUserId: 11,
    createdAt: "2022-10-30T17:00:00",
    latestStatus: AppealStatus.Accept,
    updatedAt: "2022-10-30T17:00:00",
  },
  {
    id: 1000,
    assignmentConfigAndUserId: 10,
    createdAt: "2022-10-30T16:00:00",
    latestStatus: AppealStatus.Pending,
    updatedAt: "2022-10-30T16:00:00",
  },
  {
    id: 3000,
    assignmentConfigAndUserId: 13,
    createdAt: "2022-10-30T13:00:00",
    latestStatus: AppealStatus.Reject,
    updatedAt: "2022-10-30T13:00:00",
  },
  {
    id: 4000,
    assignmentConfigAndUserId: 14,
    createdAt: "2022-10-28T15:00:00",
    latestStatus: AppealStatus.Pending,
    updatedAt: "2022-10-30T16:30:00",
  },
];
export const dummyUserData: User[] = [
  {
    assignedTasks: [],
    courses: [],
    createdAt: "",
    hasTeachingRole: false,
    id: 100,
    initials: "L",
    isAdmin: false,
    itsc: "lorem",
    name: "LOREM, Ipsum",
    sections: [],
    submissions: [],
    updatedAt: "",
  },
  {
    assignedTasks: [],
    courses: [],
    createdAt: "",
    hasTeachingRole: false,
    id: 100,
    initials: "C",
    isAdmin: false,
    itsc: "ctm",
    name: "CHAN, Tai Man Tom",
    sections: [],
    submissions: [],
    updatedAt: "",
  },
  {
    assignedTasks: [],
    courses: [],
    createdAt: "",
    hasTeachingRole: false,
    id: 100,
    initials: "C",
    isAdmin: false,
    itsc: "csm",
    name: "CHEUNG, Siu Ming",
    sections: [],
    submissions: [],
    updatedAt: "",
  },
  {
    assignedTasks: [],
    courses: [],
    createdAt: "",
    hasTeachingRole: false,
    id: 100,
    initials: "J",
    isAdmin: false,
    itsc: "jdoe",
    name: "John, DOE",
    sections: [],
    submissions: [],
    updatedAt: "",
  },
];
export const dummyOldGradeData: Grade[] = [];
export const dummyNewGradeData: Grade[] = [];
