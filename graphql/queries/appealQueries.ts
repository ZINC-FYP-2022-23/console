import { gql } from "@apollo/client";

export const GET_NUMBER_OF_APPEALS_AND_STATUS = gql`
  subscription getNumberOfAppeals($assignmentConfigId: bigint!) {
    assignment_appeals_aggregate(where: { assignmentConfigId: { _eq: $assignmentConfigId } }) {
      aggregate {
        count
      }
      nodes {
        status
      }
    }
  }
`;

// TODO(BRYAN): For `submissions` under `user`, check `isAppeal` is false to get the latest non-appeal assignment submission
export const GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID = gql`
  subscription getAppealDetailsList($assignmentConfigId: bigint!) {
    appeals(where: { assignmentConfigId: { _eq: $assignmentConfigId } }) {
      createdAt
      id
      newFileSubmissionId
      status
      updatedAt
      userId
      assignmentConfigId
      user {
        id
        name
        itsc
        submissions {
          id
          reports(order_by: { createdAt: desc }, limit: 1) {
            grade
          }
        }
      }
      submission {
        reports {
          grade
        }
      }
    }
  }
`;

export const GET_APPEAL_CONFIG = gql`
  query getAppealConfig($assignmentConfigId: bigint!) {
    assignmentConfig(id: $assignmentConfigId) {
      appealLimits
      isAppealAllowed
      isAppealStudentReplyAllowed
      appealStartAt
      appealStopAt
      isAppealViewReportAllowed
    }
  }
`;

export const GET_SUBMISSION_GRADE = gql`
  query getSubmissionGrade($userId: bigint!, $assignmentConfigId: bigint!) {
    submissions(where: { user_id: { _eq: $userId }, assignment_config_id: { _eq: $assignmentConfigId } }) {
      id
      reports(order_by: { createdAt: desc }, limit: 1) {
        grade
      }
    }
  }
`;

/* Queries used in `Appeal Details Page` */
export const GET_ASSIGNMENT_CONFIG_ID_BY_APPEAL_ID = gql`
  query getAppealDetails($appealId: bigint!) {
    appeal(id: $appealId) {
      assignmentConfigId
    }
  }
`;

export const GET_APPEAL_DETAILS_BY_APPEAL_ID = gql`
  subscription getAppealDetails($appealId: bigint!) {
    appeal(id: $appealId) {
      id
      assignmentConfigId
      createdAt
      newFileSubmissionId
      status
      updatedAt
      userId
      user {
        id
        name
        itsc
        submissions {
          id
          reports(order_by: { createdAt: desc }, limit: 1) {
            grade
          }
        }
      }
      submission {
        reports {
          grade
        }
      }
    }
  }
`;

export const GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID = gql`
  subscription getChangeLogs($appealId: bigint!) {
    changeLogs(where: { appealId: { _eq: $appealId } }, order_by: { createdAt: desc }) {
      assignmentConfigId
      createdAt
      id
      initiatedBy
      originalState
      reason
      reportId
      submissionId
      type
      updatedState
      userId
    }
  }
`;

export const GET_APPEAL_MESSAGES = gql`
  subscription getAppealMessages($appealId: bigint!) {
    appealMessages(where: { appealId: { _eq: $appealId } }, order_by: { createdAt: desc }) {
      createdAt
      id
      isRead
      message
      senderId
      user {
        isAdmin
        name
        itsc
        hasTeachingRole
      }
    }
  }
`;
/* End of Queries used in `Appeal Details Page` */
