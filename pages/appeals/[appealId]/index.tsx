import { AppealLogMessage } from "@/components/Appeal/AppealLogMessage";
import { AppealResult } from "@/components/Appeal/AppealResult";
import { AppealTextMessage } from "@/components/Appeal/AppealTextMessage";
import { NumberInput } from "@/components/Input";
import RichTextEditor from "@/components/RichTextEditor";
import { LayoutProvider } from "@/contexts/layout";
import { CREATE_APPEAL_MESSAGE, CREATE_CHANGE_LOG, UPDATE_APPEAL_STATUS } from "@/graphql/mutations/appealMutations";
import {
  GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID,
  GET_APPEAL_DETAILS_BY_APPEAL_ID,
  GET_APPEAL_MESSAGES,
  GET_ASSIGNMENT_SUBMISSIONS,
  GET_IDS_BY_APPEAL_ID,
} from "@/graphql/queries/appealQueries";
import { Layout } from "@/layout";
import { AppealAttempt, AppealStatus } from "@/types";
import { AppealLog, ChangeLogTypes, DisplayMessageType } from "@/types/appeal";
import { Submission as SubmissionType } from "@/types/tables";
import { mergeDataToActivityLogList, transformToAppealAttempt } from "@/utils/appealUtils";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { Alert, clsx, createStyles, Modal } from "@mantine/core";
import { zonedTimeToUtc } from "date-fns-tz";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import { initializeApollo } from "../../../lib/apollo";

/**
 * Return a state to be uploaded to database (for mutation) according to the appeal status
 * @param status - The status to be transformed to a state to upload to database
 * @returns {string} The state that corresponds to the status
 */
function statusToState(status: AppealStatus) {
  if (status == AppealStatus.Accept) {
    return "[{'status':ACCEPTED}]";
  } else if (status == AppealStatus.Reject) {
    return "[{'status':REJECTED}]";
  } else {
    return "[{'status':PENDING}]";
  }
}

type NewChangeLog = {
  createdAt: Date;
  type: string;
  originalState: string;
  updatedState: string;
  initiatedBy: number;
  reason: string;
  appealId: number;
  userId: number;
  assignmentConfigId: number;
  submissionId: number;
};

interface createNewChangeLogProps {
  userId: number;
  submissionId: number;
  appealAttempt: AppealAttempt;
  type: string;
  newStatus?: AppealStatus;
  oldScore?: number | string;
  newScore?: number | string;
}

/**
 * Returns a new change log to create a Change Log with `CREATE_CHANGE_LOG`
 * @returns {(ChangeLog & { userId: number, assignmentConfigId: number, submissionId: number })}
 */
function createNewChangeLog({
  userId,
  submissionId,
  appealAttempt,
  type,
  newStatus,
  oldScore,
  newScore,
}: createNewChangeLogProps) {
  let originalState: string = "";
  let updatedState: string = "";

  // Set the `originalState` and `updatedState` according to the change log type
  if (type == "APPEAL_STATUS") {
    originalState = statusToState(appealAttempt.latestStatus);
    if (newStatus) updatedState = statusToState(newStatus);
  } else if (type == "SCORE") {
    if (oldScore) originalState = "[{'score':" + oldScore.toString() + "}]";
    if (newScore) updatedState = "[{'score':" + newScore.toString() + "}]";
  } else {
    alert("Error: `createNewChangeLog` cannot be runned without `newStatus` or `newScore`");
  }

  const newLog: NewChangeLog = {
    createdAt: zonedTimeToUtc(new Date(), "Asia/Hong_Kong"),
    type,
    originalState,
    updatedState,
    initiatedBy: appealAttempt.userId,
    reason: "",
    appealId: appealAttempt.id,
    userId,
    assignmentConfigId: appealAttempt.assignmentConfigId,
    submissionId,
  };

  return newLog;
}

interface CustomModalProps {
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
function CustomModal({ changeLog, modalOpen, setModalOpen, appealAttempt }: CustomModalProps) {
  const [reason, setReason] = useState("");
  const [createChangeLog] = useMutation(CREATE_CHANGE_LOG);
  const [updateAppealStatus] = useMutation(UPDATE_APPEAL_STATUS);

  let type: ChangeLogTypes;
  let mutationText: string | null = null;
  let text: string;

  if (changeLog.type === "APPEAL_STATUS") {
    text = "The appeal status will be updated to ";
    type = ChangeLogTypes.APPEAL_STATUS;
    if (changeLog.updatedState === "[{'status':ACCEPTED}]") {
      mutationText = "ACCEPTED";
    } else if (changeLog.updatedState === "[{'status':REJECTED}]") {
      mutationText = "REJECTED";
    } else {
      mutationText = "PENDING";
    }
  } else if (changeLog.type === "SCORE") {
    text = "The score will be updated to ";
    type = ChangeLogTypes.SCORE;
    mutationText = changeLog.updatedState.replace(/[^0-9]/g, "");
  } else {
    text = "There is will be an update in submission ";
    type = ChangeLogTypes.SUBMISSION;
  }

  return (
    <Modal
      size="60%"
      opened={modalOpen}
      onClose={() => {
        setModalOpen(false);
      }}
      title="Type the reasoning for the following change:"
    >
      {/* Display change */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-yellow-300 rounded-full flex justify-center items-center">
          {changeLog.type === "APPEAL_STATUS" && <FontAwesomeIcon icon={["fad", "gavel"]} />}
          {changeLog.type === "SCORE" && <FontAwesomeIcon icon={["fad", "star"]} />}
          {changeLog.type === "SUBMISSION" && <FontAwesomeIcon icon={["fad", "inbox-in"]} />}
        </div>
        <p className="ml-2 text-sm text-gray-600">
          {text}
          <p className="text-green-600 font-bold">
            {mutationText === "ACCEPTED" && <p>Accepted</p>}
            {mutationText === "REJECTED" && <p className="text-red-600">Rejected</p>}
            {mutationText === "PENDING" && <p className="text-yellow-600">Pending</p>}
            {changeLog.type === "SCORE" && <p>{mutationText}</p>}
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
          if (reason && reason == "<p><br></p>") {
            alert("Please fill in the reasoning for the change.");
          } else {
            changeLog.reason = reason;
            createChangeLog({
              variables: {
                input: changeLog,
              },
            });

            if (type === ChangeLogTypes.APPEAL_STATUS) {
              updateAppealStatus({
                variables: {
                  id: appealAttempt.id,
                  status: mutationText,
                },
              });
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
  userId: number;
  submissionId: number;
  appealAttempt: AppealAttempt;
}

/**
 * Returns a box that shows the latest appeal status and allow TAs to change the status
 */
function ChangeAppealStatus({ userId, submissionId, appealAttempt }: ChangeAppealStatusProps) {
  const initialLog: NewChangeLog = createNewChangeLog({
    userId,
    submissionId,
    appealAttempt,
    type: "APPEAL_STATUS",
    newStatus: AppealStatus.Pending,
  });
  const [newLog, setNewLog] = useState(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  const latestStatus = appealAttempt.latestStatus;

  // Set CSS style for the appeal status buttons
  const defaultappealButton: string =
    "bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150";
  let appealAcceptButton: string = defaultappealButton;
  let appealPendingButton: string = defaultappealButton;
  let appealRejectButton: string = defaultappealButton;
  if (latestStatus === AppealStatus.Accept) {
    appealAcceptButton = "bg-green-600 text-white";
  } else if (latestStatus === AppealStatus.Pending) {
    appealPendingButton = "bg-yellow-600 text-white";
  } else {
    appealRejectButton = "bg-red-600 text-white";
  }

  return (
    <div className="w-auto h-full px-5 py-4 bg-white text-gray-700 shadow rounded-md">
      <CustomModal changeLog={newLog} modalOpen={modalOpen} setModalOpen={setModalOpen} appealAttempt={appealAttempt} />
      <p className="font-medium flex justify-self-center text-lg bold">Appeal Status:</p>
      <br />
      <div className="col-span-2">
        <AppealResult appealResult={latestStatus || AppealStatus.Pending} />
      </div>
      <br />
      <div className="flex-row w-full grid grid-cols-3 gap-x-5 place-items-center">
        {/* Accept Button */}
        <a
          className={`${appealAcceptButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.Accept) {
              setNewLog(
                createNewChangeLog({
                  userId,
                  submissionId,
                  appealAttempt,
                  type: "APPEAL_STATUS",
                  newStatus: AppealStatus.Accept,
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
        </a>
        {/* Pending Button */}
        <a
          className={`${appealPendingButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.Pending) {
              setNewLog(
                createNewChangeLog({
                  userId,
                  submissionId,
                  appealAttempt,
                  type: "APPEAL_STATUS",
                  newStatus: AppealStatus.Pending,
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
        </a>
        {/* Reject Button */}
        <a
          className={`${appealRejectButton} w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (latestStatus !== AppealStatus.Reject) {
              setNewLog(
                createNewChangeLog({
                  userId,
                  submissionId,
                  appealAttempt,
                  type: "APPEAL_STATUS",
                  newStatus: AppealStatus.Reject,
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
        </a>
      </div>
    </div>
  );
}

interface ChangeScoreProps {
  userId: number;
  submissionId: number;
  appealAttempt: AppealAttempt;
  oldScore: number;
  maxScore: number;
}

/**
 * Returns a box that shows the score and allow TAs to change the score
 */
function ChangeScore({ userId, submissionId, appealAttempt, oldScore, maxScore }: ChangeScoreProps) {
  const [newScore, setNewScore] = useState(oldScore);
  const initialLog: NewChangeLog = createNewChangeLog({
    userId,
    submissionId,
    appealAttempt,
    type: "SCORE",
    oldScore,
    newScore: newScore,
  });
  const [newLog, setNewLog] = useState(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  let isBlank: boolean = false; // The number input field is blank

  return (
    <div className="w-auto h-full px-5 py-4 bg-white text-gray-700 shadow rounded-md">
      <CustomModal changeLog={newLog} modalOpen={modalOpen} setModalOpen={setModalOpen} appealAttempt={appealAttempt} />
      <p className="font-medium flex justify-self-center text-lg bold">
        Score: {oldScore} / {maxScore}
      </p>
      <br />
      <p className="font-medium flex justify-self-center text-lg bold">Score Update:</p>
      <div className="h-1.5" />
      <NumberInput
        value={oldScore}
        onChange={(score) => {
          if (score) {
            setNewScore(score);
            isBlank = false;
          } else {
            isBlank = true;
          }
        }}
      />
      <div className="h-1.5" />
      <div className="flex w-full justify-center">
        <a
          className={`bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150 w-full px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
          onClick={() => {
            if (newScore === oldScore) {
              alert("Updated score cannot be the same as old score");
            } else if (newScore > maxScore) {
              alert("Updated score cannot be larger than the maximum score");
            } else if (isBlank) {
              alert("The input field is blank, please input a new score.");
            } else {
              setNewLog(
                createNewChangeLog({
                  userId,
                  submissionId,
                  appealAttempt,
                  type: "SCORE",
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
        </a>
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
  setComments;
}

/**
 * Returns a appeal submission button
 */
function MessageButton({ userId, comments, setComments }: MessageButtonProps) {
  // TODO(BRYAN): Investigate whether the new Date() will count the time when the page is opened OR when the button is pressed
  const router = useRouter();
  const { appealId } = router.query;
  const now = new Date();
  const [createAppealMessage] = useMutation(CREATE_APPEAL_MESSAGE);

  return (
    <button
      className="px-4 py-1 rounded-md text-lg bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition ease-in-out duration-150"
      onClick={async () => {
        // Check if the text message blank. The student should filled in something for the appeal.
        if (comments === null || comments === "") {
          alert("Please Fill All Required Field");
        } else {
          createAppealMessage({
            variables: {
              input: {
                message: comments,
                senderId: userId,
                appealId: appealId,
                createdAt: zonedTimeToUtc(now, "Asia/Hong_Kong"),
              },
            },
          });
          setComments("");
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
};

/**
 * Return a component that shows the Activity Log under the Activity Log Tab to show all appeal messages and appeal logs
 */
function ActivityLogTab({ userId, activityLogList }: ActivityLogTabProps) {
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
                  <AppealLogMessage key={log.id} log={log} showButton={false} />
                </div>
              );
            } else if (log._type === "appealMessage") {
              return <AppealTextMessage key={log.id} message={log} />;
            }
          },
        )}
      </div>
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

interface AppealDetailsProps {
  appealId: number;
  userId: number;
  courseId: number; // The course ID that the appeal is related to
  submissionId: number;
  assignmentConfigId: number;
  diffSubmissionsData: DiffSubmissionsData;
}

/**
 * Returns the entire Appeal Details page
 */
function AppealDetails({
  appealId,
  userId,
  submissionId,
  assignmentConfigId,
  diffSubmissionsData,
}: AppealDetailsProps) {
  // Fetch data with GraphQL
  const {
    data: appealsDetailsData,
    loading: appealDetailsLoading,
    error: appealDetailsError,
  } = useSubscription(GET_APPEAL_DETAILS_BY_APPEAL_ID, { variables: { appealId: appealId } });
  const {
    data: appealChangeLogData,
    loading: appealChangeLogLoading,
    error: appealChangeLogError,
  } = useSubscription(GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID, { variables: { appealId: appealId } });
  const {
    data: appealMessagesData,
    loading: appealMessagesLoading,
    error: appealMessagesError,
  } = useSubscription(GET_APPEAL_MESSAGES, { variables: { appealId: appealId } });
  const {
    data: submissionsData,
    loading: submissionsLoading,
    error: submissionsError,
  } = useSubscription(GET_ASSIGNMENT_SUBMISSIONS, { variables: { assignmentConfigId } });

  // Display Loading if data fetching is still in-progress
  if (appealDetailsLoading || appealChangeLogLoading || appealMessagesLoading || submissionsLoading) {
    return <DisplayLoading />;
  }

  // Display error if it occurred
  if (appealDetailsError) {
    const errorMessage = "Unable to fetch appeal details with `GET_APPEAL_DETAILS_BY_APPEAL_ID`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (appealChangeLogError) {
    const errorMessage = "Unable to fetch appeal details with `GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (appealMessagesError) {
    const errorMessage = "Unable to fetch appeal details with `GET_APPEAL_MESSAGES`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (submissionsError) {
    const errorMessage = "Unable to fetch appeal details with `GET_ASSIGNMENT_SUBMISSIONS`";
    return <DisplayError errorMessage={errorMessage} />;
  } else if (!appealsDetailsData || !appealsDetailsData.appeal) {
    // Check if the appeal details is available, if not, there is no such appeal
    const errorMessage = "Invalid appeal. Please check the appeal number.";
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

  // Get Grade Scores
  let score: number = -1;
  // First, get the score of the original submission
  for (let i = 0; i < submissionsData.submissions.length; i++) {
    // Do not pick the submission that is related to the appeal
    if (submissionsData.submissions[i].id != appealsDetailsData.appeal.newFileSubmissionId) {
      score = submissionsData.submissions[i].reports[0].grade.score;
      break;
    }
  }
  // Second, get the latest score based on change logs
  for (let i = 0; i < appealChangeLogData.changeLogs.length; i++) {
    // Use the latest score change
    if (appealChangeLogData.changeLogs[0].type == "SCORE") {
      score = appealChangeLogData.changeLogs[0].updatedState.replace(/[^0-9]/g, "");
      break;
    }
    // Use the new file submission score submitted with the appeal
    if (
      appealAttempt[0].latestStatus === AppealStatus.Accept &&
      appealChangeLogData.changeLogs[0].type == "APPEAL_STATUS" &&
      appealChangeLogData.changeLogs[0].updatedState == "[{'status':ACCEPTED}]" &&
      appealsDetailsData.appeal.submission &&
      appealsDetailsData.appeal.submission.reports.length() > 0
    ) {
      score = appealsDetailsData.appeal.submission.reports[0].grade.score;
      break;
    }
  }

  const totalScore: number = submissionsData.submissions[0].reports[0].grade.maxTotal;

  return (
    <LayoutProvider>
      <Layout title="Appeal Detail">
        <div className="p-6 w-full flex flex-col overflow-y-auto">
          <h1 className="text-2xl text-gray-900 font-bold leading-7">Appeal Details</h1>
          <div className="flex flex-row mt-8">
            {/* Appeal Information */}
            <div className="max-w-md mr-4 px-5 py-4 grid grid-cols-3 gap-4 bg-white text-gray-700 shadow rounded-md">
              <p className="font-medium">Name:</p>
              <p className="col-span-2">{appealsDetailsData.appeal.user.name}</p>
              <p className="font-medium">ITSC:</p>
              <p className="col-span-2">{appealsDetailsData.appeal.user.itsc}</p>
            </div>
            {/* Appeal Status */}
            <div className="max-w-md mr-4 px-5">
              <ChangeAppealStatus userId={userId} submissionId={submissionId} appealAttempt={appealAttempt[0]} />
            </div>
            {/* Score */}
            <div className="max-w-md mr-4 px-5 y-full">
              <ChangeScore
                userId={userId}
                submissionId={submissionId}
                appealAttempt={appealAttempt[0]}
                oldScore={score}
                maxScore={totalScore}
              />
            </div>
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
                  <ActivityLogTab userId={userId} activityLogList={activityLogList} />
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
  const userId = parseInt(req.cookies.user);
  const appealId = parseInt(query.appealId as string);

  const { data: idData } = await apolloClient.query({
    query: GET_IDS_BY_APPEAL_ID,
    variables: {
      appealId: appealId,
    },
  });

  const assignmentConfigId: number = idData.appeal.assignmentConfigId;

  // TODO(BRYAN): Obtain the submission IDs from the backend
  const oldSubmissionId: number = 1;
  const newSubmissionId: number = idData.appeal.newFileSubmissionId;
  let diffSubmissionsData: DiffSubmissionsData;
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

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      appealId,
      userId,
      assignmentConfigId,
      diffSubmissionsData,
      submissionId: oldSubmissionId,
    },
  };
};

export default AppealDetails;
