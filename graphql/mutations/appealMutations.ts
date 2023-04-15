import { gql } from "@apollo/client";

export const CREATE_APPEAL = gql`
  mutation createAppeal($input: assignment_appeals_insert_input!) {
    createAppeal(object: $input) {
      id
    }
  }
`;

export const CREATE_APPEAL_MESSAGE = gql`
  mutation createAppealMessage($input: assignment_appeal_messages_insert_input!) {
    createAppealMessage(object: $input) {
      id
    }
  }
`;

export const CREATE_CHANGE_LOG = gql`
  mutation createChangeLog($input: change_logs_insert_input!) {
    createLog(object: $input) {
      id
    }
  }
`;

export const UPDATE_APPEAL_STATUS = gql`
  mutation updateAppealStatus(
    $changeLogInput: change_logs_insert_input!
    $status: String!
    $updatedAt: timestamp!
    $appealId: bigint!
  ) {
    updateAppeal(pk_columns: { id: $appealId }, _set: { status: $status, updatedAt: $updatedAt }) {
      id
    }
    createLog(object: $changeLogInput) {
      id
    }
  }
`;
