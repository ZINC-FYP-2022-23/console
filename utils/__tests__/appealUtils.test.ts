import { transformAppealStatus, transformToAppealAttempt, mergeDataToActivityLogList } from "../appealUtils";
import { AppealAttempt, AppealStatus } from "@/types/appeal";

describe("Grade Appeal: Utils", () => {
  describe("transformAppealStatus()", () => {
    it("status set as accept", () => {
      const originalStatus = "ACCEPTED";
      const transformedStatus = transformAppealStatus(originalStatus);
      expect(transformedStatus).toStrictEqual(AppealStatus.Accept);
    });

    it("status set as pending", () => {
      const originalStatus = "PENDING";
      const transformedStatus = transformAppealStatus(originalStatus);
      expect(transformedStatus).toStrictEqual(AppealStatus.Pending);
    });

    it("status set as reject", () => {
      const originalStatus = "REJECTED";
      const transformedStatus = transformAppealStatus(originalStatus);
      expect(transformedStatus).toStrictEqual(AppealStatus.Reject);
    });
  });

  describe("transformToAppealAttempt()", () => {
    it("zero appeal", () => {
      const appealsDetailsData = { appeals: [] };
      const appealAttempts = transformToAppealAttempt({ appealsDetailsData });
      expect(appealAttempts).toStrictEqual([]);
    });

    it("single appeal", () => {
      const appealsDetailsData = {
        appeal: {
          id: 1,
          newFileSubmissionId: 2,
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          updatedAt: "Wed Feb 06 2019 17:00:02",
          status: "ACCEPTED",
        },
      };

      const appealAttempts = transformToAppealAttempt({ appealsDetailsData });

      expect(appealAttempts).toStrictEqual([
        {
          id: 1,
          newFileSubmissionId: 2,
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ]);
    });

    it("two appeals", () => {
      const appealsDetailsData = {
        appeals: [
          {
            id: 1,
            newFileSubmissionId: 2,
            assignmentConfigId: 3,
            userId: 4,
            createdAt: "Tue Feb 05 2019 12:00:00",
            updatedAt: "Wed Feb 06 2019 13:00:00",
            status: "PENDING",
          },
          {
            id: 5,
            newFileSubmissionId: 6,
            assignmentConfigId: 7,
            userId: 8,
            createdAt: "Thu Feb 07 2019 14:00:00",
            updatedAt: "Fri Feb 08 2019 15:00:00",
            status: "REJECTED",
          },
        ],
      };

      const appealAttempts = transformToAppealAttempt({ appealsDetailsData });

      expect(appealAttempts).toStrictEqual([
        {
          id: 1,
          newFileSubmissionId: 2,
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:00:00",
          updatedAt: "Wed Feb 06 2019 13:00:00",
          latestStatus: AppealStatus.Pending,
        },
        {
          id: 5,
          newFileSubmissionId: 6,
          assignmentConfigId: 7,
          userId: 8,
          createdAt: "Thu Feb 07 2019 14:00:00",
          updatedAt: "Fri Feb 08 2019 15:00:00",
          latestStatus: AppealStatus.Reject,
        },
      ]);
    });
  });

  describe("mergeDataToActivityLogList()", () => {
    // Test cases for the Appeal Details Page (Student and Console UI)
    it("empty appeal, empty log, empty message, no submission", () => {
      const appealAttempt: AppealAttempt[] = [];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const appealMessagesData = {
        appealMessages: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

      const expectedList = [];

      expect(logList).toStrictEqual(expectedList);
    });

    it("one appeal, empty log, empty message, no submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const appealMessagesData = {
        appealMessages: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("one appeal, two logs, empty message, no submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-26T13:03:29.497",
            id: 67,
            initiatedBy: 6,
            originalState: "[{'status':PENDING}]",
            reason: "<p>234</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':ACCEPTED}]",
            userId: 6,
          },
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-24T16:20:12.27",
            id: 66,
            initiatedBy: 6,
            originalState: "[{'status':ACCEPTED}]",
            reason: "<p>5</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':PENDING}]",
            userId: 6,
          },
        ],
      };

      const appealMessagesData = {
        appealMessages: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "2023-03-26T13:03:29.497",
          id: 67,
          originalState: "Pending",
          reason: "<p>234</p>",
          type: 0,
          updatedState: "Accepted",
        },
        {
          _type: "appealLog",
          date: "2023-03-24T16:20:12.27",
          id: 66,
          originalState: "Accepted",
          reason: "<p>5</p>",
          type: 0,
          updatedState: "Pending",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("one appeal, empty logs, two messages, no submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const appealMessagesData = {
        appealMessages: [
          {
            createdAt: "2023-03-26T13:22:25.26",
            id: 15,
            isRead: false,
            message: "<p>Hello</p>",
            senderId: 6,
            user: {
              isAdmin: true,
              name: "TEACHER, Teacher",
              itsc: "~teacher",
              hasTeachingRole: true,
            },
          },
          {
            createdAt: "2023-03-22T19:02:05.166",
            id: 14,
            isRead: false,
            message: "<p>Hello</p><p><br></p>",
            senderId: 6,
            user: {
              isAdmin: true,
              name: "TEACHER, Teacher",
              itsc: "~teacher",
              hasTeachingRole: true,
            },
          },
        ],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

      const expectedList = [
        {
          _type: "appealMessage",
          content: "<p>Hello</p>",
          id: 15,
          name: "TEACHER, Teacher",
          time: "2023-03-26T13:22:25.26",
          type: "Teaching Assistant",
        },
        {
          _type: "appealMessage",
          content: "<p>Hello</p><p><br></p>",
          id: 14,
          name: "TEACHER, Teacher",
          time: "2023-03-22T19:02:05.166",
          type: "Teaching Assistant",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("one appeal, two logs, two messages, no submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-26T13:03:29.497",
            id: 67,
            initiatedBy: 6,
            originalState: "[{'status':PENDING}]",
            reason: "<p>234</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':ACCEPTED}]",
            userId: 6,
          },
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-24T16:20:12.27",
            id: 66,
            initiatedBy: 6,
            originalState: "[{'status':ACCEPTED}]",
            reason: "<p>5</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':PENDING}]",
            userId: 6,
          },
        ],
      };

      const appealMessagesData = {
        appealMessages: [
          {
            createdAt: "2023-03-26T13:22:25.26",
            id: 15,
            isRead: false,
            message: "<p>Hello</p>",
            senderId: 6,
            user: {
              isAdmin: true,
              name: "TEACHER, Teacher",
              itsc: "~teacher",
              hasTeachingRole: true,
            },
          },
          {
            createdAt: "2023-03-22T19:02:05.166",
            id: 14,
            isRead: false,
            message: "<p>Hello</p><p><br></p>",
            senderId: 6,
            user: {
              isAdmin: true,
              name: "TEACHER, Teacher",
              itsc: "~teacher",
              hasTeachingRole: true,
            },
          },
        ],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

      const expectedList = [
        {
          _type: "appealMessage",
          content: "<p>Hello</p>",
          id: 15,
          name: "TEACHER, Teacher",
          time: "2023-03-26T13:22:25.26",
          type: "Teaching Assistant",
        },
        {
          _type: "appealLog",
          date: "2023-03-26T13:03:29.497",
          id: 67,
          originalState: "Pending",
          reason: "<p>234</p>",
          type: 0,
          updatedState: "Accepted",
        },
        {
          _type: "appealLog",
          date: "2023-03-24T16:20:12.27",
          id: 66,
          originalState: "Accepted",
          reason: "<p>5</p>",
          type: 0,
          updatedState: "Pending",
        },
        {
          _type: "appealMessage",
          content: "<p>Hello</p><p><br></p>",
          id: 14,
          name: "TEACHER, Teacher",
          time: "2023-03-22T19:02:05.166",
          type: "Teaching Assistant",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    // Test cases for the Assignment Details Page (Student UI)
    it("empty appeal, empty log, no message, empty submission", () => {
      const appealAttempt: AppealAttempt[] = [];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const submissionData = {
        submissions: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, submissionData });

      const expectedList = [];

      expect(logList).toStrictEqual(expectedList);
    });

    it("two appeals, empty logs, no messages, empty submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 5,
          newFileSubmissionId: "6",
          assignmentConfigId: 7,
          userId: 8,
          createdAt: "Tue Feb 09 2019 12:05:22",
          latestStatus: AppealStatus.Reject,
          updatedAt: "Wed Feb 10 2019 17:00:02",
        },
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const submissionData = {
        submissions: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, submissionData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "Tue Feb 09 2019 12:05:22",
          id: 5,
          type: "APPEAL_SUBMISSION",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("two appeals, two logs, no messages, empty submission", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 5,
          newFileSubmissionId: "6",
          assignmentConfigId: 7,
          userId: 8,
          createdAt: "Tue Feb 09 2019 12:05:22",
          latestStatus: AppealStatus.Reject,
          updatedAt: "Wed Feb 10 2019 17:00:02",
        },
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-26T13:03:29.497",
            id: 67,
            initiatedBy: 6,
            originalState: "[{'status':PENDING}]",
            reason: "<p>234</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':ACCEPTED}]",
            userId: 6,
          },
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-24T16:20:12.27",
            id: 66,
            initiatedBy: 6,
            originalState: "[{'status':ACCEPTED}]",
            reason: "<p>5</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':PENDING}]",
            userId: 6,
          },
        ],
      };

      const submissionData = {
        submissions: [],
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, submissionData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "2023-03-26T13:03:29.497",
          id: 67,
          originalState: "Pending",
          reason: "<p>234</p>",
          type: 0,
          updatedState: "Accepted",
        },
        {
          _type: "appealLog",
          date: "2023-03-24T16:20:12.27",
          id: 66,
          originalState: "Accepted",
          reason: "<p>5</p>",
          type: 0,
          updatedState: "Pending",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 09 2019 12:05:22",
          id: 5,
          type: "APPEAL_SUBMISSION",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("two appeal, empty logs, no messages, two submissions", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 5,
          newFileSubmissionId: "6",
          assignmentConfigId: 7,
          userId: 8,
          createdAt: "Tue Feb 09 2024 12:05:22",
          latestStatus: AppealStatus.Reject,
          updatedAt: "Wed Feb 10 2024 17:00:02",
        },
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [],
      };

      const submissionData = {
        data: {
          submissions: [
            {
              id: 1,
              created_at: "2023-03-15T16:51:52.244546",
              upload_name: "aggregated.zip",
              fail_reason: null,
              reports: [],
            },
            {
              id: 2,
              created_at: "2025-03-15T16:51:52.244546",
              upload_name: "aggregated.zip",
              fail_reason: null,
              reports: [],
            },
          ],
        },
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, submissionData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "Tue Feb 09 2024 12:05:22",
          id: 5,
          type: "APPEAL_SUBMISSION",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });

    it("two appeal, two logs, no messages, two submissions", () => {
      const appealAttempt: AppealAttempt[] = [
        {
          id: 5,
          newFileSubmissionId: "6",
          assignmentConfigId: 7,
          userId: 8,
          createdAt: "Tue Feb 09 2024 12:05:22",
          latestStatus: AppealStatus.Reject,
          updatedAt: "Wed Feb 10 2024 17:00:02",
        },
        {
          id: 1,
          newFileSubmissionId: "2",
          assignmentConfigId: 3,
          userId: 4,
          createdAt: "Tue Feb 05 2019 12:05:22",
          latestStatus: AppealStatus.Accept,
          updatedAt: "Wed Feb 06 2019 17:00:02",
        },
      ];

      const appealChangeLogData = {
        changeLogs: [
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-26T13:03:29.497",
            id: 67,
            initiatedBy: 6,
            originalState: "[{'status':PENDING}]",
            reason: "<p>234</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':ACCEPTED}]",
            userId: 6,
          },
          {
            assignmentConfigId: 1,
            createdAt: "2023-03-24T16:20:12.27",
            id: 66,
            initiatedBy: 6,
            originalState: "[{'status':ACCEPTED}]",
            reason: "<p>5</p>",
            reportId: null,
            submissionId: 1,
            type: "APPEAL_STATUS",
            updatedState: "[{'status':PENDING}]",
            userId: 6,
          },
        ],
      };

      const submissionData = {
        data: {
          submissions: [
            {
              id: 1,
              created_at: "2023-03-15T16:51:52.244546",
              upload_name: "aggregated.zip",
              fail_reason: null,
              reports: [],
            },
            {
              id: 2,
              created_at: "2025-03-15T16:51:52.244546",
              upload_name: "aggregated.zip",
              fail_reason: null,
              reports: [],
            },
          ],
        },
      };

      const logList = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, submissionData });

      const expectedList = [
        {
          _type: "appealLog",
          date: "Tue Feb 09 2024 12:05:22",
          id: 5,
          type: "APPEAL_SUBMISSION",
        },
        {
          _type: "appealLog",
          date: "2023-03-26T13:03:29.497",
          id: 67,
          originalState: "Pending",
          reason: "<p>234</p>",
          type: 0,
          updatedState: "Accepted",
        },
        {
          _type: "appealLog",
          date: "2023-03-24T16:20:12.27",
          id: 66,
          originalState: "Accepted",
          reason: "<p>5</p>",
          type: 0,
          updatedState: "Pending",
        },
        {
          _type: "appealLog",
          date: "Tue Feb 05 2019 12:05:22",
          id: 1,
          type: "APPEAL_SUBMISSION",
        },
      ];

      expect(logList).toStrictEqual(expectedList);
    });
  });
});
