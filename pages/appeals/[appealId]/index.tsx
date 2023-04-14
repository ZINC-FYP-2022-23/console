import { AppealLogMessage } from "@/components/Appeal/AppealLogMessage";
import { AppealResult } from "@/components/Appeal/AppealResult";
import { AppealTextMessage } from "@/components/Appeal/AppealTextMessage";
import { NumberInput } from "@/components/Input";
import RichTextEditor from "@/components/RichTextEditor";
import { LayoutProvider, useLayoutDispatch } from "@/contexts/layout";
import {
  GET_APPEALS_BY_USER_ID_AND_ASSIGNMENT_ID,
  GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID,
  GET_APPEAL_DETAILS_BY_APPEAL_ID,
  GET_APPEAL_MESSAGES,
  GET_IDS_BY_APPEAL_ID,
  GET_SUBMISSIONS_BY_ASSIGNMENT_AND_USER_ID,
} from "@/graphql/queries/appealQueries";
import { Layout } from "@/layout";
import {
  Appeal,
  AppealAttempt,
  AppealLog,
  AppealMessage,
  AppealStatus,
  ChangeLogState,
  ChangeLogTypes,
  DisplayMessageType,
  Submission as SubmissionType,
} from "@/types";
import { ChangeLog } from "@/types/tables";
import { isInputEmpty, mergeDataToActivityLogList, transformToAppealAttempt } from "@/utils/appealUtils";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { Alert, Modal, clsx, createStyles } from "@mantine/core";
import axios from "axios";
import { zonedTimeToUtc } from "date-fns-tz";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import { initializeApollo } from "../../../lib/apollo";

type NewChangeLog = {
  createdAt: Date;
  type: string;
  originalState: ChangeLogState;
  updatedState: ChangeLogState;
  reason: string;
  appealId: number;
  userId: number;
  assignmentConfigId: number;
};

interface createNewChangeLogProps {
  appealAttempt: AppealAttempt;
  type: string;
  newStatus?: AppealStatus;
  oldScore?: number;
  newScore?: number;
}

/**
 * Returns a new change log to create a Change Log with `CREATE_CHANGE_LOG`
 * @returns {(ChangeLog & { userId: number, assignmentConfigId: number })}
 */
function createNewChangeLog({ appealAttempt, type, newStatus, oldScore, newScore }: createNewChangeLogProps) {
  let originalState, updatedState;

  // Set the `originalState` and `updatedState` according to the change log type
  if (type === ChangeLogTypes.APPEAL_STATUS && newStatus) {
    originalState = {
      type: "status",
      status: appealAttempt.latestStatus,
    };
    updatedState = {
      type: "status",
      status: newStatus,
    };
  } else if (type === ChangeLogTypes.SCORE && oldScore !== undefined && newScore !== undefined) {
    originalState = {
      type: "score",
      score: oldScore,
    };
    updatedState = {
      type: "score",
      score: newScore,
    };
  } else {
    alert("Error: `createNewChangeLog` cannot be run without `newStatus` or `newScore`");
  }

  const newLog: NewChangeLog = {
    createdAt: zonedTimeToUtc(new Date(), "Asia/Hong_Kong"),
    type,
    originalState,
    updatedState,
    reason: "",
    appealId: appealAttempt.id,
    userId: appealAttempt.userId,
    assignmentConfigId: appealAttempt.assignmentConfigId,
  };

  return newLog;
}

interface ChangeConfirmModalProps {
  /** New Appeal Log to be inputted */
  changeLog: NewChangeLog;
  /** Modal (i.e. pop-up window) appears or not */
  modalOpen: boolean;
  /** Function that sets the bollean of `modalOpen` */
  setModalOpen;
  /** Details of the appeal attempt */
  appealAttempt: AppealAttempt;
}

/**
 * Returns a custom Modal that confirms the appeal changes made by the TA
 * */
function ChangeConfirmModal({ changeLog, modalOpen, setModalOpen, appealAttempt }: ChangeConfirmModalProps) {
  const [reason, setReason] = useState("");
  const dispatch = useLayoutDispatch();

  let type: ChangeLogTypes;
  let mutationText: string | null = null;
  let text: string;

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
              // TODO: fix logic
              try {
                await axios({
                  method: "POST",
                  url: `/api/changes/status`,
                  data: {
                    newChangeLog: changeLog,
                    appealId: appealAttempt.id,
                    status: changeLog.updatedState.type === "status" && changeLog.updatedState.status,
                  },
                });
                return;
              } catch (error: any) {
                const { status: statusCode, data: responseJson } = error.response;
                if (statusCode === 403) {
                  // 403 Forbidden
                  dispatch({
                    type: "showNotification",
                    payload: {
                      title: "Appeal message denied",
                      message: responseJson.error,
                      success: false,
                    },
                  });
                  return;
                }
                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Unable to send appeal message",
                    message:
                      "Failed to send appeal message due to network/server issues. Please submit again.\n" + error,
                    success: false,
                  },
                });
              }
            } else if (type === ChangeLogTypes.SCORE) {
              // TODO: fix logic
              try {
                await axios({
                  method: "POST",
                  url: `/api/changes/score`,
                  data: changeLog,
                });
                return;
              } catch (error: any) {
                const { status: statusCode, data: responseJson } = error.response;
                if (statusCode === 403) {
                  // 403 Forbidden
                  dispatch({
                    type: "showNotification",
                    payload: {
                      title: "Appeal message denied",
                      message: responseJson.error,
                      success: false,
                    },
                  });
                  return;
                }
                dispatch({
                  type: "showNotification",
                  payload: {
                    title: "Unable to send appeal message",
                    message:
                      "Failed to send appeal message due to network/server issues. Please submit again.\n" + error,
                    success: false,
                  },
                });
              }
            }

            setModalOpen(false);
          }
        }}
      >
        Confirm
      </button>
    </Modal>
  );
}

interface ChangeAppealStatusProps {
  appealAttempt: AppealAttempt;
}

/**
 * Returns a box that shows the latest appeal status and allow TAs to change the status
 */
function ChangeAppealStatus({ appealAttempt }: ChangeAppealStatusProps) {
  const initialLog: NewChangeLog = createNewChangeLog({
    appealAttempt,
    type: ChangeLogTypes.APPEAL_STATUS,
    newStatus: AppealStatus.PENDING,
  });
  const [newLog, setNewLog] = useState(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  const latestStatus = appealAttempt.latestStatus;

  // Set CSS style for the appeal status buttons
  const defaultAppealButton =
    "bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150";
  let appealAcceptButton = defaultAppealButton;
  let appealPendingButton = defaultAppealButton;
  let appealRejectButton = defaultAppealButton;
  if (latestStatus === AppealStatus.ACCEPTED) {
    appealAcceptButton = "bg-green-600 text-white";
  } else if (latestStatus === AppealStatus.PENDING) {
    appealPendingButton = "bg-yellow-600 text-white";
  } else {
    appealRejectButton = "bg-red-600 text-white";
  }

  return (
    <div className="w-auto h-full px-5 py-4 bg-white text-gray-700 shadow rounded-md">
      <ChangeConfirmModal
        changeLog={newLog}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        appealAttempt={appealAttempt}
      />
      <p className="font-medium flex justify-self-center text-lg bold">Appeal Status:</p>
      <br />
      <div className="col-span-2">
        <AppealResult appealResult={latestStatus || AppealStatus.PENDING} />
      </div>
      <br />
      <div className="flex-row w-full grid grid-cols-3 gap-x-5 place-items-center">
        {/* Accept Button */}
        <button
          className={`${appealAcceptButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.ACCEPTED) {
              setNewLog(
                createNewChangeLog({
                  appealAttempt,
                  type: ChangeLogTypes.APPEAL_STATUS,
                  newStatus: AppealStatus.ACCEPTED,
                }),
              );
              setModalOpen(true);
            }
          }}
        >
          <div className="w-full">
            <FontAwesomeIcon icon={["far", "check"]} />
            <div className="px-auto" />
            <span>Accept</span>
          </div>
        </button>
        {/* Pending Button */}
        <button
          className={`${appealPendingButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.PENDING) {
              setNewLog(
                createNewChangeLog({
                  appealAttempt,
                  type: ChangeLogTypes.APPEAL_STATUS,
                  newStatus: AppealStatus.PENDING,
                }),
              );
              setModalOpen(true);
            }
          }}
        >
          <div className="w-full">
            <FontAwesomeIcon icon={["far", "question"]} />
            <div className="px-auto" />
            <span>Pending</span>
          </div>
        </button>
        {/* Reject Button */}
        <button
          className={`${appealRejectButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.REJECTED) {
              setNewLog(
                createNewChangeLog({
                  appealAttempt,
                  type: ChangeLogTypes.APPEAL_STATUS,
                  newStatus: AppealStatus.REJECTED,
                }),
              );
              setModalOpen(true);
            }
          }}
        >
          <div className="w-full">
            <FontAwesomeIcon icon={["far", "xmark"]} />
            <div className="px-auto" />
            <span>Reject</span>
          </div>
        </button>
      </div>
    </div>
  );
}

interface ChangeScoreProps {
  appealAttempt: AppealAttempt;
  oldScore: number;
  maxScore: number;
}

/**
 * Returns a box that shows the score and allow TAs to change the score
 */
function ChangeScore({ appealAttempt, oldScore, maxScore }: ChangeScoreProps) {
  const [newScore, setNewScore] = useState(oldScore);
  const initialLog: NewChangeLog = createNewChangeLog({
    appealAttempt,
    type: ChangeLogTypes.SCORE,
    oldScore: oldScore!,
    newScore: newScore!,
  });
  const [newLog, setNewLog] = useState(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  /** Whether the input box is blank. */
  const [isBlank, setIsBlank] = useState(false);

  return (
    <div className="w-auto h-full px-5 py-4 bg-white text-gray-700 shadow rounded-md">
      <ChangeConfirmModal
        changeLog={newLog}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        appealAttempt={appealAttempt}
      />
      <p className="font-medium flex justify-self-center text-lg bold">
        Current Score: {oldScore} / {maxScore}
      </p>
      <br />
      <p className="font-medium flex justify-self-center text-lg bold">New Final Score:</p>
      <div className="h-1.5" />
      <NumberInput
        value={oldScore}
        max={maxScore}
        min={0}
        onChange={(score) => {
          if (score === undefined) {
            setIsBlank(true);
          } else {
            setNewScore(score);
            setIsBlank(false);
          }
        }}
      />
      <div className="h-1.5" />
      <div className="flex w-full justify-center">
        <button
          className={`bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150 w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
          disabled={isBlank}
          onClick={() => {
            if (newScore === oldScore) {
              alert("Updated score cannot be the same as old score");
            } else if (newScore > maxScore) {
              alert("Updated score cannot be larger than the maximum score");
            } else if (isBlank) {
              alert("The input field is blank, please input a new score.");
            } else if (newScore < 0) {
              alert("Updated score cannot be negative");
            } else {
              setNewLog(
                createNewChangeLog({
                  appealAttempt,
                  type: ChangeLogTypes.SCORE,
                  oldScore,
                  newScore,
                }),
              );
              setModalOpen(true);
            }
          }}
        >
          <div className="w-full flex items-center gap-1 justify-center">
            <FontAwesomeIcon icon={["far", "pen-to-square"]} />
            <div className="px-auto" />
            <span>Update</span>
          </div>
        </button>
      </div>
    </div>
  );
}

/* Start of Tabs-related components */

interface MessageButtonProps {
  /** The text message sent to the TA when submitting the appeal */
  comments: string;
  userId: number;
  /** Function that sets the texts shown in the editor */
  setComments: (x: string) => void;
}

/**
 * Returns a appeal submission button
 */
function MessageButton({ userId, comments, setComments }: MessageButtonProps) {
  const router = useRouter();
  const { appealId } = router.query;
  const now = new Date();
  const dispatch = useLayoutDispatch();

  return (
    <button
      className="px-4 py-1 rounded-md text-lg bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition ease-in-out duration-150"
      onClick={async () => {
        // Check if the text message blank. The student should filled in something for the appeal.
        if (isInputEmpty(comments)) {
          alert("Please Fill All Required Field");
        } else {
          try {
            await axios({
              method: "POST",
              url: `/api/appeals/messages`,
              data: {
                message: comments,
                senderId: userId,
                appealId,
              },
            });

            setComments("");
            return;
          } catch (error: any) {
            const { status: statusCode, data: responseJson } = error.response;
            if (statusCode === 403) {
              // 403 Forbidden
              dispatch({
                type: "showNotification",
                payload: {
                  title: "Appeal message denied",
                  message: responseJson.error,
                  success: false,
                },
              });
              return;
            }
            dispatch({
              type: "showNotification",
              payload: {
                title: "Unable to send appeal message",
                message: "Failed to send appeal message due to network/server issues. Please submit again.\n" + error,
                success: false,
              },
            });
          }
        }
      }}
    >
      Send Message
    </button>
  );
}

type ActivityLogTabProps = {
  userId: number;
  /** A list of logs that may include appeal messages and appeal logs */
  activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[];
  /** Allow message to be sent or not */
  allowChange: boolean;
};

/**
 * Return a component that shows the Activity Log under the Activity Log Tab to show all appeal messages and appeal logs
 */
function ActivityLogTab({ userId, activityLogList, allowChange }: ActivityLogTabProps) {
  const [comments, setComments] = useState("");

  return (
    <div className="flex flex-col space-y-2">
      <div>
        {activityLogList.map(
          (
            log:
              | (SubmissionType & { _type: "submission" })
              | (DisplayMessageType & { _type: "appealMessage" })
              | (AppealLog & { _type: "appealLog" }),
          ) => {
            if (log._type === "appealLog") {
              return (
                <div className="px-3">
                  <AppealLogMessage key={log.id} log={log} showReason />
                </div>
              );
            } else if (log._type === "appealMessage") {
              return <AppealTextMessage key={log.id} message={log} />;
            }
          },
        )}
      </div>
      {allowChange && (
        <div className="mb-6 sticky bottom-0 object-bottom">
          {/* @ts-ignore */}
          <RichTextEditor
            id="rte"
            value={comments}
            onChange={setComments}
            controls={[
              ["bold", "italic", "underline"],
              ["h1", "h2", "h3", "unorderedList", "orderedList"],
            ]}
          />
          <div className="py-1" />
          {/* Hide the Send Message Button if the text editor is empty */}
          {comments && comments !== "<p><br></p>" && (
            <div className="flex justify-center">
              <MessageButton userId={userId} comments={comments} setComments={setComments} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type CodeComparisonTabProps = {
  diffData: DiffSubmissionsData;
};

/**
 * Data returned by the webhook `/diffSubmissions` endpoint, which compares two assignment submissions.
 */
type DiffSubmissionsData = {
  /** Diff output between the old submission and the new submission. */
  diff: string;
  /** Error message if any. */
  error: string | null;
  /** HTTP status of the API call. */
  status: number;
};

/**
 * Show the difference between new and old file submissions under the Code Comparison Tab by using ReactGhLikeDiff
 */
function CodeComparisonTab({ diffData }: CodeComparisonTabProps) {
  const useStyles = createStyles(() => ({
    diffView: {
      "& .d2h-file-name": {
        // Overrides the hidden file name in `index.css`
        display: "block !important",
      },
    },
  }));

  const { classes } = useStyles();
  const { diff, error, status } = diffData;

  if (status === -1) {
    return <p className="mt-8 text-center text-gray-600">This appeal attempt does not include a file submission.</p>;
  }

  if (status !== 200) {
    return (
      <div className="mt-8 flex flex-col items-center space-y-5 text-red-500">
        <FontAwesomeIcon icon={["far", "circle-exclamation"]} size="3x" />
        <div className="space-y-2 text-center">
          <p>An error occurred while comparing old and new submissions.</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (diff === "") {
    return (
      <p className="mt-8 text-center text-gray-600">The new appeal submission is the same as the old submission.</p>
    );
  }
  return (
    <div className={clsx("relative", classes.diffView)}>
      <ReactGhLikeDiff
        options={{
          outputFormat: "side-by-side",
          showFiles: true,
        }}
        diffString={diff}
      />
    </div>
  );
}

/* End of Tabs-related components */

interface DisplayErrorProps {
  /** Message shown to the user when encountering an error */
  errorMessage: string;
}

/**
 * Returns an error page
 */
function DisplayError({ errorMessage }: DisplayErrorProps) {
  return (
    <LayoutProvider>
      <Layout title="Grade Appeal Details">
        <main className="flex-1 flex bg-gray-200 overflow-y-auto">
          <div className="p-5 flex flex-1 flex-col h-full w-max">
            <div className="pb-3">
              <div className="my-6 mt-8 flex flex-col items-center self-center mb-4">
                <Alert
                  icon={<FontAwesomeIcon icon={["far", "circle-exclamation"]} />}
                  title="Appeal Unavailable"
                  color="red"
                  variant="filled"
                >
                  {errorMessage}
                </Alert>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </LayoutProvider>
  );
}

/**
 * Returns a loading page to show fetching data is in progress
 */
function DisplayLoading() {
  return (
    <LayoutProvider>
      <Layout title="Grade Appeal Details">
        <main className="flex-1 flex bg-gray-200 overflow-y-auto">
          <div className="p-5 flex flex-1 flex-col h-full w-max">
            <div className="pb-3">
              <div className="my-1 flex items-center">
                <h1 className="flex-1 font-semibold text-2xl text-center">Grade Appeal</h1>
              </div>
              <div>Loading Data...</div>
            </div>
          </div>
        </main>
      </Layout>
    </LayoutProvider>
  );
}

interface getScoreProps {
  appeals: Appeal[];
  changeLogs: ChangeLog[];
  submissions: SubmissionType[];
}

/**
 * Gets the latest score based on the following logic:
 * @returns {number}
 */
function getScore({ appeals, changeLogs, submissions }: getScoreProps) {
  /* *** Logic of how to get the score: ***
   * If the `updatedAt` of the latest `ACCEPTED` appeal later than the date of any `SCORE` change:
   *    If `newFileSubmission` is available, >>>  use the score of the `newFileSubmission`.
   *    If `newFileSubmission` is NOT available:
   *        If there is a `SCORE` change log >>> use the score of latest `SCORE` change.
   *        If there is NO `SCORE` change log >>> use the score of the original submission.
   * If there is the date of the latest `SCORE` change than is later than the `updatedAt` of the latest `ACCEPTED` appeal >>> use the score of latest `SCORE` change
   * If there are NO `SCORE` change log AND `ACCEPTED` appeal >>> use the score of the original submission
   */

  const acceptedAppeals: Appeal[] = appeals.filter((e) => e.status === "ACCEPTED");
  let acceptedAppealDate: Date | null = null;
  let acceptedAppealScore: number | null = null;

  // Get the latest `ACCEPTED` appeal with a new score generated
  for (let i = 0; i < acceptedAppeals.length; i++) {
    if (
      acceptedAppeals[i].updatedAt &&
      acceptedAppeals[i].submission &&
      acceptedAppeals[i].submission.reports.length > 0
    ) {
      acceptedAppealDate = new Date(acceptedAppeals[i].updatedAt!);
      acceptedAppealScore = acceptedAppeals[i].submission.reports[0].grade.score;
      break;
    }
  }

  // Get the latest `SCORE` change log
  for (let i = 0; i < changeLogs.length; i++) {
    const changeLogDate: Date = new Date(changeLogs[i].createdAt);

    if (acceptedAppealDate && acceptedAppealDate > changeLogDate) {
      return acceptedAppealScore;
    }

    if (changeLogs[i].type === "SCORE") {
      return changeLogs[i].updatedState["score"];
    }
  }

  // If above fails, get the original submission score
  for (let i = 0; i < submissions.length; i++) {
    let isNewFileSubmission: boolean = false;

    // Do not pick the submission that is related to the appeal
    for (let j = 0; j < appeals.length; j++) {
      if (submissions[i].id === appeals[j].newFileSubmissionId) {
        isNewFileSubmission = true;
        break;
      }
    }

    if (!isNewFileSubmission && submissions[i].reports.length > 0 && submissions[i].reports[0].grade.score) {
      return submissions[i].reports[0].grade.score;
    }
  }
}

interface AppealDetailsProps {
  appealId: number;
  /** The user ID of the teaching assistant. */
  userId: number;
  /** The user ID of the student who submitted the appeal. */
  studentId: number;
  /** Course ID that the appeal is related to. */
  courseId: number;
  submissionId: number;
  assignmentConfigId: number;
  diffSubmissionsData: DiffSubmissionsData;
}

/**
 * Returns the entire Appeal Details page
 */
function AppealDetails({ appealId, userId, studentId, assignmentConfigId, diffSubmissionsData }: AppealDetailsProps) {
  // Fetch data with GraphQL
  const {
    data: appealsDetailsData,
    loading: appealDetailsLoading,
    error: appealDetailsError,
  } = useSubscription<{ appeal: Appeal }>(GET_APPEAL_DETAILS_BY_APPEAL_ID, { variables: { appealId: appealId } });
  const {
    data: appealChangeLogData,
    loading: appealChangeLogLoading,
    error: appealChangeLogError,
  } = useSubscription<{ changeLogs: ChangeLog[] }>(GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID, {
    variables: { appealId: appealId },
  });
  const {
    data: appealMessagesData,
    loading: appealMessagesLoading,
    error: appealMessagesError,
  } = useSubscription<{ appealMessages: AppealMessage[] }>(GET_APPEAL_MESSAGES, { variables: { appealId: appealId } });
  const {
    data: submissionsData,
    loading: submissionsLoading,
    error: submissionsError,
  } = useQuery<{ submissions: SubmissionType[] }>(GET_SUBMISSIONS_BY_ASSIGNMENT_AND_USER_ID, {
    variables: { assignmentConfigId, userId },
  });
  const {
    data: appealsData,
    loading: appealsLoading,
    error: appealsError,
  } = useQuery<{ appeals: Appeal[] }>(GET_APPEALS_BY_USER_ID_AND_ASSIGNMENT_ID, {
    variables: { userId: studentId, assignmentConfigId },
  });

  // Display Loading if data fetching is still in-progress
  if (appealDetailsLoading || appealChangeLogLoading || appealMessagesLoading || submissionsLoading || appealsLoading) {
    return <DisplayLoading />;
  }

  // Display error if it occurred
  let errorMessage: string | null = null;
  if (appealDetailsError || appealChangeLogError || appealMessagesError || submissionsError) {
    errorMessage = "Failed to fetch appeal details.";
  } else if (!appealsDetailsData || !appealsDetailsData.appeal) {
    // Check if the appeal details is available, if not, there is no such appeal
    errorMessage = "Invalid appeal. Please check the appeal number.";
  }
  if (errorMessage) {
    return <DisplayError errorMessage={errorMessage} />;
  }

  // Translate `appealDetailsData` to `AppealAttempt[]`
  let appealAttempt: AppealAttempt[] = transformToAppealAttempt({ appealsDetailsData });

  // Merge the data and create a log list
  let activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[] = mergeDataToActivityLogList({ appealAttempt, appealChangeLogData, appealMessagesData });

  // Get the original score
  const score = getScore({
    appeals: appealsData!.appeals,
    changeLogs: appealChangeLogData!.changeLogs,
    submissions: submissionsData!.submissions,
  });

  const maxScore: number = submissionsData!.submissions.filter((e) => !e.isAppeal && e.reports.length > 0)[0].reports[0]
    .grade.maxTotal;

  // Determine if new changes and messages can be submitted
  let allowChange: boolean = true;
  if (appealsData!.appeals[0].id != appealAttempt[0].id) allowChange = false;

  return (
    <LayoutProvider>
      <Layout title="Appeal Detail">
        <div className="p-6 w-full flex flex-col overflow-y-auto">
          <h1 className="text-2xl text-gray-900 font-bold leading-7">Appeal Details</h1>
          <div className="flex flex-row mt-8">
            {/* Appeal Information */}
            <div className="max-w-md mr-4 px-5 py-4 grid grid-cols-3 gap-4 bg-white text-gray-700 shadow rounded-md">
              <p className="font-medium">Name:</p>
              <p className="col-span-2">{appealsDetailsData!.appeal.user.name}</p>
              <p className="font-medium">ITSC:</p>
              <p className="col-span-2">{appealsDetailsData!.appeal.user.itsc}</p>
              {!allowChange && (
                <>
                  <p className="font-medium">Score:</p>
                  <p className="col-span-2">
                    {score} / {maxScore}
                  </p>
                </>
              )}
            </div>
            {allowChange && (
              <>
                {/* Appeal Status */}
                <div className="max-w-md px-5">
                  <ChangeAppealStatus appealAttempt={appealAttempt[0]} />
                </div>
                {/* Score */}
                <div className="max-w-md mr-4 px-5 y-full">
                  <ChangeScore appealAttempt={appealAttempt[0]} oldScore={score} maxScore={maxScore} />
                </div>
              </>
            )}
          </div>
          {/* Tabs */}
          <div className="py-2 flex-1 space-y-2">
            <Tab.Group>
              <Tab.List className="mt-3 px-6 flex gap-6 text-sm border-b w-full">
                <Tab
                  className={({ selected }) =>
                    `pb-3 px-1 border-b-2 font-medium text-sm leading-5 focus:outline-none transition ${
                      selected
                        ? "border-cse-500 text-cse-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`
                  }
                >
                  Activity Log
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `pb-3 px-1 border-b-2 font-medium text-sm leading-5 focus:outline-none transition ${
                      selected
                        ? "border-cse-500 text-cse-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`
                  }
                >
                  Code Comparison
                </Tab>
              </Tab.List>
              <Tab.Panels>
                {/* "Activity Log" tab panel */}
                <Tab.Panel>
                  <ActivityLogTab userId={userId} activityLogList={activityLogList} allowChange={allowChange} />
                </Tab.Panel>
                {/* "Code Comparison" tab panel */}
                <Tab.Panel>
                  <CodeComparisonTab diffData={diffSubmissionsData} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Layout>
    </LayoutProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const apolloClient = initializeApollo(req.headers.cookie!);
  const appealId = parseInt(query.appealId as string);
  const userId = parseInt(req.cookies.user);

  // Fetch data via GraphQL
  const { data: idData } = await apolloClient.query<{ appeal: Appeal }>({
    query: GET_IDS_BY_APPEAL_ID,
    variables: {
      appealId: appealId,
    },
  });
  const studentId = idData.appeal.userId;
  const { data: submissionsData } = await apolloClient.query<{ submissions: SubmissionType[] }>({
    query: GET_SUBMISSIONS_BY_ASSIGNMENT_AND_USER_ID,
    variables: { assignmentConfigId: idData.appeal.assignmentConfigId, userId: studentId },
  });

  // Get Ids
  const assignmentConfigId: number = idData.appeal.assignmentConfigId;
  const newSubmissionId: number = idData.appeal.newFileSubmissionId || -1;
  const oldSubmissionId: number = submissionsData.submissions.filter((e) => !e.isAppeal)[0].id;

  let diffSubmissionsData: DiffSubmissionsData;
  if (newSubmissionId === -1) {
    diffSubmissionsData = { diff: "", status: -1, error: null };
  } else {
    try {
      const response = await fetch(
        `http://${process.env.WEBHOOK_ADDR}/diffSubmissions?oldId=${oldSubmissionId}&newId=${newSubmissionId}`,
        {
          method: "GET",
        },
      );
      const { status } = response;
      const { diff, error } = await response.json();
      diffSubmissionsData = { diff, error, status };
    } catch (error) {
      diffSubmissionsData = { diff: "", status: 500, error: "An unknown error has occurred." };
    }
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      appealId,
      userId,
      studentId,
      assignmentConfigId,
      diffSubmissionsData,
      submissionId: oldSubmissionId,
    },
  };
};

export default AppealDetails;