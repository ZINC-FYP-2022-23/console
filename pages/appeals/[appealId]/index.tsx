import AppealChangeConfirmModal from "@/components/Appeal/AppealChangeConfirmModal";
import AppealCodeComparison from "@/components/Appeal/AppealCodeComparison";
import { AppealLogMessage } from "@/components/Appeal/AppealLogMessage";
import { AppealResult } from "@/components/Appeal/AppealResult";
import { AppealTextMessage } from "@/components/Appeal/AppealTextMessage";
import { NumberInput } from "@/components/Input";
import { ReportSlideOver } from "@/components/Report";
import RichTextEditor from "@/components/RichTextEditor";
import { SlideOver } from "@/components/SlideOver";
import { Spinner } from "@/components/Spinner";
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
  DiffSubmissionsData,
  DisplayMessageType,
  Submission as SubmissionType,
} from "@/types";
import { ChangeLog } from "@/types/tables";
import {
  getMaxScore,
  getScore,
  isInputEmpty,
  mergeDataToActivityLogList,
  transformToAppealAttempt,
} from "@/utils/appealUtils";
import { getLocalDateFromString } from "@/utils/date";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { Alert, clsx } from "@mantine/core";
import axios from "axios";
import { zonedTimeToUtc } from "date-fns-tz";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { initializeApollo } from "../../../lib/apollo";

export type NewChangeLog = {
  createdAt: Date;
  type: string;
  originalState: ChangeLogState;
  updatedState: ChangeLogState;
  reason: string;
  appealId: number;
  userId: number;
  assignmentConfigId: number;
};

interface CreateNewChangeLogProps {
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
function createNewChangeLog({ appealAttempt, type, newStatus, oldScore, newScore }: CreateNewChangeLogProps) {
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
    // } else {
    //   alert("Error: `createNewChangeLog` cannot be run without `newStatus` or `newScore`");
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
    <div className="w-auto h-full px-5 py-3 bg-white text-gray-700 shadow rounded-md">
      <AppealChangeConfirmModal
        changeLog={newLog}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        appealAttempt={appealAttempt}
      />
      <p className="mb-5 font-semibold text-lg">Appeal Status</p>
      <AppealResult appealResult={latestStatus || AppealStatus.PENDING} />
      <div className="mt-5 flex-row w-full grid grid-cols-3 gap-x-5 place-items-center">
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
    oldScore: oldScore,
    newScore: newScore,
  });
  const [newLog, setNewLog] = useState(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  /** Whether the input box is blank. */
  const [isBlank, setIsBlank] = useState(false);

  // Refresh score values if scores are changed from appeal or other change logs
  useEffect(() => {
    setNewScore(oldScore);
  }, [oldScore]);

  return (
    <div className="w-auto h-full px-5 py-3 bg-white text-gray-700 shadow rounded-md">
      <AppealChangeConfirmModal
        changeLog={newLog}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        appealAttempt={appealAttempt}
      />
      <p className="mb-5 font-semibold text-lg">Score Adjustment</p>
      <div className="mb-4">
        <span className="font-medium">Current score:</span>{" "}
        <span className="ml-2">
          {oldScore} / {maxScore}
        </span>
      </div>
      <p className="mb-1 font-medium">Update final score to:</p>
      <div className="flex gap-2">
        <div className="flex-[2]">
          <NumberInput
            value={newScore}
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
        </div>
        <button
          className="flex-1 bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150 px-3 py-2 border text-center border-gray-300 text-sm font-medium rounded-lg focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
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
  const dispatch = useLayoutDispatch();

  return (
    <button
      className="px-4 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition ease-in-out duration-150"
      // Disable the Send Message Button if the text editor is empty
      disabled={isInputEmpty(comments)}
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
function ActivityLogTab({ activityLogList }: ActivityLogTabProps) {
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
                <div key={`log-${log.id}`} className="px-3">
                  <AppealLogMessage key={log.id} log={log} showReason />
                </div>
              );
            } else if (log._type === "appealMessage") {
              return <AppealTextMessage key={`msg-${log.id}`} message={log} />;
            }
          },
        )}
      </div>
      <div className="h-6" />
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
      <Layout title="Appeal Details">
        <div className="w-full my-20 flex justify-center">
          <Spinner className="h-16 w-16 text-cse-500" />
        </div>
      </Layout>
    </LayoutProvider>
  );
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
    variables: { assignmentConfigId, userId: studentId },
  });
  const {
    data: appealsData,
    loading: appealsLoading,
    error: appealsError,
  } = useQuery<{ appeals: Appeal[] }>(GET_APPEALS_BY_USER_ID_AND_ASSIGNMENT_ID, {
    variables: { userId: studentId, assignmentConfigId },
  });

  const [comments, setComments] = useState("");

  // Display Loading if data fetching is still in-progress
  if (appealDetailsLoading || appealChangeLogLoading || appealMessagesLoading || submissionsLoading || appealsLoading) {
    return <DisplayLoading />;
  }

  const maxScore = getMaxScore(submissionsData?.submissions);

  const appeal = appealsDetailsData?.appeal;

  // Get change logs that are not for future appeals
  const changeLogs = appeal?.user.changeLogsByUserId.filter(
    (c) =>
      c.appealId === appeal.id || getLocalDateFromString(c.createdAt)! <= getLocalDateFromString(appeal.updatedAt)!,
  );

  // Get the original score
  const score = getScore({
    appeals: appealsData?.appeals,
    changeLogs,
    submissions: submissionsData?.submissions,
  });

  // Display error if it occurred
  let errorMessage: string | null = null;
  if (appealDetailsError || appealChangeLogError || appealMessagesError || submissionsError) {
    errorMessage = "Failed to fetch appeal details.";
  } else if (!appealsDetailsData || !appealsDetailsData.appeal) {
    // Check if the appeal details is available, if not, there is no such appeal
    errorMessage = "Invalid appeal. Please check the appeal number.";
  } else if (score === undefined || maxScore === undefined) {
    errorMessage =
      "Failed to fetch submission scores. Please check if this student is eligible for grade appeal. Alternatively, please regenerate reports for this student.";
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

  // Determine if new changes and messages can be submitted
  let allowChange: boolean = true;
  if (appealsData!.appeals[0].id !== appealAttempt[0].id) allowChange = false;

  let appealTextStyle: any = null;
  if (!allowChange) {
    switch (appealsDetailsData?.appeal.status) {
      case AppealStatus.ACCEPTED: {
        appealTextStyle = {
          textColor: "text-green-600",
          iconName: "check",
          status: "Accepted",
        };
        break;
      }
      case AppealStatus.REJECTED: {
        appealTextStyle = {
          textColor: "text-red-600",
          iconName: "xmark",
          status: "Rejected",
        };
        break;
      }
      case AppealStatus.PENDING: {
        appealTextStyle = {
          textColor: "text-yellow-600",
          iconName: "clock",
          status: "Pending",
        };
        break;
      }
    }
  }

  /** The UTC string timestamp of when this appeal is submitted. */
  const appealSubmissionDateRaw: string | undefined = activityLogList.find(
    (log) => log._type === "appealLog" && log.type === "APPEAL_SUBMISSION",
  )?.["date"];
  let appealSubmissionDate: Date | null = null;
  if (appealSubmissionDateRaw) {
    appealSubmissionDate = getLocalDateFromString(appealSubmissionDateRaw);
  }

  return (
    <LayoutProvider>
      <Layout title="Appeal Detail">
        <div className="p-6 w-full flex flex-col overflow-y-auto">
          <h1 className="text-2xl text-gray-900 font-bold leading-7">Appeal Details</h1>
          <div className="flex flex-row my-4 gap-4 max-w-6xl">
            {/* Appeal Information */}
            <div className="flex-1 max-w-sm">
              <div className="h-full px-5 py-3 bg-white text-gray-700 shadow rounded-md">
                <p className="mb-5 font-semibold text-lg">General Info</p>
                <div className="grid grid-cols-3 gap-1">
                  <p className="font-medium">Name:</p>
                  <p className="col-span-2">{appealsDetailsData!.appeal.user.name}</p>
                  <p className="font-medium">ITSC:</p>
                  <p className="col-span-2">{appealsDetailsData!.appeal.user.itsc}</p>
                  {appealSubmissionDate && (
                    <>
                      <p className="font-medium">Created on:</p>
                      <p className="col-span-2">{appealSubmissionDate.toLocaleString("en-HK")}</p>
                    </>
                  )}
                  {!allowChange && (
                    <>
                      <p className="font-medium">Score:</p>
                      <p className="col-span-2">
                        {score} / {maxScore!}
                      </p>
                    </>
                  )}
                  {appealTextStyle && (
                    <>
                      <p className="font-medium">Status:</p>
                      <p className="col-span-2">
                        <FontAwesomeIcon
                          icon={["far", appealTextStyle.iconName]}
                          className={`${appealTextStyle.textColor} mr-2`}
                        />
                        <span className={appealTextStyle.textColor}>{appealTextStyle.status}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            {allowChange && (
              <>
                {/* Appeal Status */}
                <div className="flex-1">
                  <ChangeAppealStatus appealAttempt={appealAttempt[0]} />
                </div>
                {/* Score */}
                <div className="flex-1">
                  <ChangeScore appealAttempt={appealAttempt[0]} oldScore={score!} maxScore={maxScore!} />
                </div>
              </>
            )}
          </div>
          {allowChange && (
            <div className="p-3 flex-row justify-between bg-white rounded-md shadow">
              {/* FIXME: The control bar should not be sticky */}
              <RichTextEditor
                id="rte"
                value={comments}
                onChange={setComments}
                controls={[
                  ["bold", "italic", "underline"],
                  ["h1", "h2", "h3", "unorderedList", "orderedList"],
                ]}
              />
              <div className="mt-2 flex justify-end">
                <MessageButton userId={userId} comments={comments} setComments={setComments} />
              </div>
            </div>
          )}
          {/* Tabs */}
          <div className="py-4 flex-1">
            <Tab.Group>
              {/* <Tab.List className="mt-3 px-6 flex gap-6 text-sm border-b w-full"> */}
              <Tab.List className="flex bg-blue-100 text-sm">
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "py-3 px-5 border-b-2 font-semibold transition rounded-md rounded-b-none",
                      selected
                        ? "bg-blue-200 text-cse-600 border-cse-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none",
                    )
                  }
                >
                  Activity Log
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "py-3 px-5 border-b-2 font-semibold transition rounded-md rounded-b-none",
                      selected
                        ? "bg-blue-200 text-cse-600 border-cse-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none",
                    )
                  }
                >
                  Code Comparison
                </Tab>
              </Tab.List>
              <Tab.Panels className="bg-gray-100 rounded-b-md shadow">
                {/* "Activity Log" tab panel */}
                <Tab.Panel>
                  <ActivityLogTab activityLogList={activityLogList} />
                </Tab.Panel>
                {/* "Code Comparison" tab panel */}
                <Tab.Panel>
                  <AppealCodeComparison diffData={diffSubmissionsData} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Layout>
      <SlideOver>
        <ReportSlideOver />
      </SlideOver>
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
        { method: "GET" },
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
