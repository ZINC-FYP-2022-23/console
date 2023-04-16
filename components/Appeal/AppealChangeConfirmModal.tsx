import RichTextEditor from "@/components/RichTextEditor";
import { useLayoutDispatch } from "@/contexts/layout";
import { AppealAttempt, AppealStatus, ChangeLogTypes } from "@/types/appeal";
import { isInputEmpty } from "@/utils/appealUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "@mantine/core";
import axios from "axios";
import { NewChangeLog } from "pages/appeals/[appealId]";
import { useState } from "react";

interface AppealChangeConfirmModalProps {
  /** New Appeal Log to be inputted */
  changeLog: NewChangeLog;
  /** Modal (i.e. pop-up window) appears or not */
  modalOpen: boolean;
  /** Function that sets the boolean of `modalOpen` */
  setModalOpen: (modalOpen: boolean) => void;
  /** Details of the appeal attempt */
  appealAttempt: AppealAttempt;
}

/**
 * Returns a custom Modal that confirms the appeal changes made by the TA.
 * */
function AppealChangeConfirmModal({
  changeLog,
  modalOpen,
  setModalOpen,
  appealAttempt,
}: AppealChangeConfirmModalProps) {
  const [reason, setReason] = useState("");
  const dispatch = useLayoutDispatch();

  let type: ChangeLogTypes;
  let mutationText: string | null = null;
  let text = "";

  if (changeLog.type === ChangeLogTypes.APPEAL_STATUS && changeLog.updatedState.type === "status") {
    text = "The appeal status will be updated to ";
    type = ChangeLogTypes.APPEAL_STATUS;
    mutationText = changeLog.updatedState.status;
  } else if (changeLog.type === ChangeLogTypes.SCORE && changeLog.updatedState.type === "score") {
    text = "The score will be updated to ";
    type = ChangeLogTypes.SCORE;
    mutationText = changeLog.updatedState.score.toString();
  } else {
    text = "There will be an update in submission ";
    type = ChangeLogTypes.SUBMISSION;
  }

  return (
    <Modal
      size="60%"
      opened={modalOpen}
      onClose={() => {
        setModalOpen(false);
      }}
      title="Please enter the reason for the following change:"
    >
      {/* Display change */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-yellow-300 rounded-full flex justify-center items-center">
          {changeLog.type === ChangeLogTypes.APPEAL_STATUS && <FontAwesomeIcon icon={["fad", "gavel"]} />}
          {changeLog.type === ChangeLogTypes.SCORE && <FontAwesomeIcon icon={["fad", "star"]} />}
          {changeLog.type === ChangeLogTypes.SUBMISSION && <FontAwesomeIcon icon={["fad", "inbox-in"]} />}
        </div>
        <p className="ml-2 text-sm text-gray-600">
          {text}
          <p className="text-green-600 font-bold">
            {mutationText === AppealStatus.ACCEPTED && <p>Accepted</p>}
            {mutationText === AppealStatus.REJECTED && <p className="text-red-600">Rejected</p>}
            {mutationText === AppealStatus.PENDING && <p className="text-yellow-600">Pending</p>}
            {changeLog.type === ChangeLogTypes.SCORE && <p>{mutationText}</p>}
          </p>
        </p>
      </div>
      <div className="py-1" />
      {/* @ts-ignore */}
      <RichTextEditor
        id="rte"
        value={reason}
        onChange={setReason}
        controls={[
          ["bold", "italic", "underline"],
          ["h1", "h2", "h3", "unorderedList", "orderedList"],
        ]}
      />
      <div className="py-1" />
      <button
        className="w-full px-4 py-1 rounded-md text-sm bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition ease-in-out duration-150"
        onClick={async () => {
          if (isInputEmpty(reason)) {
            alert("Please fill in the reasoning for the change.");
          } else {
            changeLog.reason = reason;

            if (type === ChangeLogTypes.APPEAL_STATUS) {
              try {
                await axios({
                  method: "POST",
                  url: `/api/changes/status`,
                  data: {
                    reason: reason,
                    appealId: appealAttempt.id,
                    updatedState: changeLog.updatedState,
                  },
                });

                setReason("");
                setModalOpen(false);

                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Appeal status change successful",
                    success: true,
                  },
                });

                return;
              } catch (error: any) {
                const { status: statusCode, data: responseJson } = error.response;
                if (statusCode === 403 || statusCode === 422) {
                  // 403 Forbidden OR 422 Unprocessable Content
                  dispatch({
                    type: "showNotification",
                    payload: {
                      title: "Appeal status change denied",
                      message: responseJson.error,
                      success: false,
                    },
                  });
                  return;
                }
                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Unable to change appeal status",
                    message:
                      "Failed to change appeal status due to network/server issues. Please submit again.\n" + error,
                    success: false,
                  },
                });
              }
            } else if (type === ChangeLogTypes.SCORE) {
              try {
                await axios({
                  method: "POST",
                  url: `/api/changes/score`,
                  data: {
                    appealId: appealAttempt.id,
                    originalState: changeLog.originalState,
                    updatedState: changeLog.updatedState,
                    reason: reason,
                  },
                });

                setReason("");
                setModalOpen(false);

                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Score change successful",
                    success: true,
                  },
                });

                return;
              } catch (error: any) {
                const { status: statusCode, data: responseJson } = error.response;
                if (statusCode === 403 || statusCode === 422) {
                  // 403 Forbidden OR 422 Unprocessable Content
                  dispatch({
                    type: "showNotification",
                    payload: {
                      title: "Score change denied",
                      message: responseJson.error,
                      success: false,
                    },
                  });
                  return;
                }
                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Unable to change student score",
                    message: "Failed to change student score due to network/server issues. Please try again.\n" + error,
                    success: false,
                  },
                });
              }
            }
          }
        }}
      >
        Confirm
      </button>
    </Modal>
  );
}

export default AppealChangeConfirmModal;
