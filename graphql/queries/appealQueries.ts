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

export const GET_APPEALS_DETAILS_BY_ASSIGNMENT_ID = gql`
  subscription getAppealDetailsList($assignmentConfigId: bigint!) {
    appeals(where: { assignmentConfigId: { _eq: $assignmentConfigId } }, order_by: { createdAt: desc }) {
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
        submissions(where: { assignment_config_id: { _eq: $assignmentConfigId } }, order_by: { created_at: desc }) {
          id
          reports(order_by: { createdAt: desc }, limit: 1) {
            grade
          }
        }
        change_logs(where: { assignmentConfigId: { _eq: $assignmentConfigId } }, order_by: { createdAt: desc }) {
          id
          appealId
          assignmentConfigId
          type
          updatedState
          originalState
          createdAt
          initiatedBy
          reason
          reportId
          submissionId
        }
      }
      submission {
        reports(order_by: { createdAt: desc }, limit: 1) {
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

export const GET_SUBMISSIONS_BY_ASSIGNMENT_ID = gql`
  subscription getAssignmentSubmissions($assignmentConfigId: bigint!) {
    submissions(where: { assignment_config_id: { _eq: $assignmentConfigId } }, order_by: { created_at: desc }) {
      id
      assignment_config_id
      reports(order_by: { createdAt: desc }, limit: 1) {
        id
        grade
      }
      created_at
      isLate
      remarks
      user_id
    }
  }
`;

/* Queries used in `Appeal Details Page` */
export const GET_APPEAL_DETAILS_BY_APPEAL_ID = gql`
  subscription getAppealDetails($appealId: bigint!) {
    appeal(id: $appealId) {
      id
      assignmentConfigId
      assignment_config {
        assignment {
          course_id
          id
        }
        id
      }
      createdAt
      newFileSubmissionId
      status
      updatedAt
      userId
      user {
        id
        name
        itsc
      }
      submission {
        reports(order_by: { createdAt: desc }, limit: 1) {
          grade
          id
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

export const GET_SUBMISSIONS_BY_ASSIGNMENT_AND_USER_ID = gql`
  subscription getAssignmentSubmissions($assignmentConfigId: bigint!, $userId: bigint!) {
    submissions(
      where: { assignment_config_id: { _eq: $assignmentConfigId }, user_id: { _eq: $userId } }
      order_by: { created_at: desc }
    ) {
      id
      assignment_config_id
      reports(order_by: { createdAt: desc }, limit: 1) {
        id
        grade
      }
    }
  }
`;

export const GET_IDS_BY_APPEAL_ID = gql`
  query getIds($appealId: bigint!) {
    appeal(id: $appealId) {
      id
      assignmentConfigId
      assignment_config {
        id
        assignment {
          id
          course_id
        }
      }
      newFileSubmissionId
      userId
      submission {
        reports(order_by: { createdAt: desc }, limit: 1) {
          grade
          id
        }
      }
    }
  }
`;

export const GET_APPEALS_BY_USER_ID_AND_ASSIGNMENT_ID = gql`
  subscription getAllUserAppeals($userId: bigint!, $assignmentConfigId: bigint!) {
    appeals(
      order_by: { createdAt: desc }
      where: { userId: { _eq: $userId }, assignmentConfigId: { _eq: $assignmentConfigId } }
    ) {
      id
      newFileSubmissionId
      assignmentConfigId
      createdAt
      status
      updatedAt
      userId
    }
  }
`;
/* End of Queries used in `Appeal Details Page` */
