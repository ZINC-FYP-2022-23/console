import { AppealLogMessage } from "@/components/Appeal/AppealLogMessage";
import { AppealResult } from "@/components/Appeal/AppealResult";
import { AppealTextMessage } from "@/components/Appeal/AppealTextMessage";
import RichTextEditor from "@/components/RichTextEditor";
import { LayoutProvider } from "@/contexts/layout";
import { CREATE_APPEAL_MESSAGE, CREATE_CHANGE_LOG } from "@/graphql/mutations/appealMutations";
import {
  GET_APPEAL_CHANGE_LOGS_BY_APPEAL_ID,
  GET_APPEAL_DETAILS_BY_APPEAL_ID,
  GET_APPEAL_MESSAGES,
} from "@/graphql/queries/appealQueries";
import { SUBMISSION_SUBSCRIPTION } from "@/graphql/queries/user";
import { Layout } from "@/layout";
import { AppealAttempt, AppealStatus, ChangeLog, ChangeLogTypes, DisplayedAppealInfo } from "@/types";
import { AppealLog, DisplayMessageType } from "@/types/appeal";
import { Submission as SubmissionType } from "@/types/tables";
import { sort, transformToAppealLog } from "@/utils/appealUtils";
import { useMutation, useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { Alert, clsx, createStyles } from "@mantine/core";
import { zonedTimeToUtc } from "date-fns-tz";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import { initializeApollo } from "../../../lib/apollo";
//import { messageList, appealAttempts, changeLogList, courseId, appealInfo, fullScore } from "@/utils/dummyData";

interface ButtonProps {
  comments: string; // The text message sent to the TA when submitting the appeal
  userId: number;
}

/**
 * Returns a appeal submission button
 */
function Button({ userId, comments }: ButtonProps) {
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
          // TODO(BRYAN): Add error checking + Notification
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
        }
      }}
    >
      Send Message
    </button>
  );
}

type ActivityLogTabProps = {
  userId: number;
  /* A list of logs that may include appeal messages and appeal logs */
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
            <Button userId={userId} comments={comments} />
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

type AppealDetailsProps = {
  appealId: number;
  userId: number;
  courseId: number; // The course ID that the appeal is related to
  assignmentId: number; // The assignment ID that the appeal is related to
  diffSubmissionsData: DiffSubmissionsData;
};

/**
 * Returns the entire Appeal Details page
 */
function AppealDetails({ appealId, userId, courseId, assignmentId, diffSubmissionsData }: AppealDetailsProps) {
  // TODO(BRYAN): Handle if Queries return nothing (i.e. invalid appealId)
  /**
   * Start of GraphQL subscriptions and mutations
   */
  const {
    data: appealDetailsData,
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

  /*const { 
    data: submissionData, 
    loading: submissionLoading, 
    error: submissionError,
  } = useSubscription<{ submissions: SubmissionType[] }>(SUBMISSION_SUBSCRIPTION, {
    variables: {
      userId: userId,
      assignmentConfigId: assignmentId,
    },
  });*/

  const [createChangeLog] = useMutation(CREATE_CHANGE_LOG);
  /**
   * End of GraphQL subscriptions and mutations
   */

  // Get Final Grade
  let originalScore: number = -1;
  let totalScore: number = -1;
  /*if (submissionData && submissionData.submissions.length > 0 && submissionData.submissions[0].reports.length > 0) {
    originalScore = submissionData.submissions[0].reports[0].grade.score;
    totalScore = submissionData.submissions[0].reports[0].grade.maxTotal;
  }*/

  // Display Error if it is present
  if (appealDetailsError || appealChangeLogError || appealMessagesError) {
    return (
      <LayoutProvider>
        <Layout title="Grade Appeal Details">
          <main className="flex-1 flex bg-gray-200 overflow-y-auto">
            <div className="p-5 flex flex-1 flex-col h-full w-max">
              <div className="pb-3">
                <div className="my-1 flex items-center">
                  {/* TODO(BRYAN): Query the assignment ID instead of passing its value from getServerSideProps(). */}
                  <Link href={`/assignments/${assignmentId}`}>
                    <a className="max-w-max-content w-max px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
                      <FontAwesomeIcon icon={["far", "chevron-left"]} className="mr-2" />
                      Back
                    </a>
                  </Link>
                  <h1 className="flex-1 font-semibold text-2xl text-center">Grade Appeal</h1>
                </div>
                <div>
                  {appealDetailsError && <div>{appealDetailsError}</div>}
                  {appealChangeLogError && <div>{appealChangeLogError}</div>}
                  {appealMessagesError && <div>{appealMessagesError}</div>}
                  {/*submissionError && <div>{submissionError}</div>*/}
                </div>
              </div>
            </div>
          </main>
        </Layout>
      </LayoutProvider>
    );
  }

  // Display Loading if data fetching is still in-progress
  if (appealDetailsLoading || appealChangeLogLoading || appealMessagesLoading) {
    return (
      <LayoutProvider>
        <Layout title="Grade Appeal Details">
          <main className="flex-1 flex bg-gray-200 overflow-y-auto">
            <div className="p-5 flex flex-1 flex-col h-full w-max">
              <div className="pb-3">
                <div className="my-1 flex items-center">
                  {/* TODO(BRYAN): Query the assignment ID instead of passing its value from getServerSideProps(). */}
                  <Link href={`/assignments/${assignmentId}`}>
                    <a className="max-w-max-content w-max px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
                      <FontAwesomeIcon icon={["far", "chevron-left"]} className="mr-2" />
                      Back
                    </a>
                  </Link>
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

  // Run the following only if data is fetched and no error occurred
  /**
   * Data Handling
   */
  // Translate `appealDetailsData` to `AppealAttempt[]`
  let appealAttempt: AppealAttempt[] = [];
  let appealInfo: DisplayedAppealInfo | null = null;
  let appealStatus: AppealStatus | null = null;
  if (appealDetailsData.appeal) {
    appealAttempt.push({
      id: appealId,
      newFileSubmissionId: appealDetailsData.appeal.newFileSubmissionId || null,
      assignmentConfigId: appealDetailsData.appeal.assignmentConfigId,
      userId: appealDetailsData.appeal.userId,
      createdAt: appealDetailsData.appeal.createdAt,
      latestStatus: appealDetailsData.appeal.status,
      updatedAt: appealDetailsData.appeal.updatedAt,
    });

    // TODO(BRYAN): Query for Name and ITSC
    appealInfo = {
      id: appealId,
      name: "Test",
      itsc: "Test",
      status: appealAttempt[0].latestStatus,
      updatedAt: appealDetailsData.appeal.updatedAt,
      originalScore: originalScore,
    };

    appealStatus = appealInfo.status;
  }

  // Translate `appealChangeLogData` to `ChangeLog[]`
  let changeLogs: ChangeLog[] = [];
  appealChangeLogData.changeLogs.forEach((log) => {
    // Assign a log type for each change log
    let logType: ChangeLogTypes;
    if (log.type == "APPEAL_STATUS") logType = ChangeLogTypes.APPEAL_STATUS;
    else if (log.type == "SCORE") logType = ChangeLogTypes.SCORE;
    else logType = ChangeLogTypes.SUBMISSION;

    changeLogs.push({
      id: log.id,
      createdAt: log.createdAt,
      type: logType,
      originalState: log.originalState,
      updatedState: log.updatedState,
      initiatedBy: log.initiatedBy,
      reason: log.reason || null,
      appealId: log.appealId || null,
    });
  });

  // Translate `appealMessagesData` to `DisplayMessageType[]`
  let messages: DisplayMessageType[] = [];
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

  // Transform and sort the lists
  let log: AppealLog[] = transformToAppealLog({ appeals: appealAttempt, changeLog: changeLogs });
  let activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[] = sort({
    messages: messages,
    appealLog: log,
  });
  /**
   * End of Data Handling
   */

  // Change Appeal Status

  function setAppealStatus(appealStatus: AppealStatus) {
    const now = new Date();
    let updatedState: string = "";
    switch (appealStatus) {
      case AppealStatus.Accept: {
        updatedState = "[{'status':ACCEPTED}]";
        break;
      }
      case AppealStatus.Reject: {
        updatedState = "[{'status':REJECTED}]";
        break;
      }
      case AppealStatus.Pending: {
        updatedState = "[{'status':PENDING}]";
        break;
      }
    }

    // TODO(BRYAN): Update this function
    /*createChangeLog({
      variables: {
        input: {
          createdAt: now,
          type: "APPEAL_STATUS",
          originalState: ,
          updatedState,
          initiatedBy: userId,
          reason: ,
          appealId: appealId,
          userId: ,
          assignmentConfigId: assignmentId,
        },
      },
    });*/
  }

  return (
    <LayoutProvider>
      <Layout title="Appeal Detail">
        <div className="p-6 w-full flex flex-col overflow-y-auto">
          <Link href={`/courses/${courseId}`}>
            <a className="max-w-max-content w-max px-3 py-1.5 mb-3 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
              <FontAwesomeIcon icon={["far", "chevron-left"]} className="mr-2" />
              Back
            </a>
          </Link>
          {appealInfo ? (
            <>
              <h1 className="text-2xl text-gray-900 font-bold leading-7">Appeal Details</h1>
              <div className="flex flex-row mt-8">
                {/* Appeal Information */}
                <div className="max-w-md mr-4 px-5 py-4 grid grid-cols-3 gap-4 bg-white text-gray-700 shadow rounded-md">
                  <p className="font-medium">Name:</p>
                  <p className="col-span-2">{appealInfo.name}</p>
                  <p className="font-medium">ITSC:</p>
                  <p className="col-span-2">{appealInfo.itsc}</p>
                  <p className="font-medium">Original Score:</p>
                  <p className="col-span-2">
                    {appealInfo.originalScore} / {totalScore}
                  </p>
                </div>
                {/* Appeal Status */}
                <div className="w-auto px-5 py-4 bg-white text-gray-700 shadow rounded-md">
                  <p className="font-medium flex justify-self-center text-lg bold">Appeal Status:</p>
                  <br />
                  <div className="col-span-2">
                    <AppealResult appealResult={appealStatus || AppealStatus.Pending} />
                  </div>
                  <br />
                  {/* TODO(Bryan): Add GraphQL Query when Appeal Status is changed to update database */}
                  <div className="flex-row w-full grid grid-cols-3 gap-x-5 place-items-center">
                    <a
                      className={`${
                        appealStatus === AppealStatus.Accept
                          ? "bg-green-600 text-white"
                          : "bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150"
                      } w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
                      onClick={() => {
                        if (appealStatus !== AppealStatus.Accept) {
                          setAppealStatus(AppealStatus.Accept);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={["far", "check"]} />
                    </a>
                    <a
                      className={`${
                        appealStatus === AppealStatus.Pending
                          ? "bg-yellow-600 text-white"
                          : "bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150"
                      } w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
                      onClick={() => {
                        if (appealStatus !== AppealStatus.Pending) {
                          setAppealStatus(AppealStatus.Pending);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={["far", "question"]} />
                    </a>
                    <a
                      className={`${
                        appealStatus === AppealStatus.Reject
                          ? "bg-red-600 text-white"
                          : "bg-white text-blue-700 hover:text-blue-500 focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150"
                      } w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg focus:outline-none`}
                      onClick={() => {
                        if (appealStatus !== AppealStatus.Reject) {
                          setAppealStatus(AppealStatus.Reject);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={["far", "xmark"]} />
                    </a>
                  </div>
                </div>
              </div>
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
            </>
          ) : (
            <div className="my-6 mt-8 flex flex-col items-center self-center mb-4">
              <Alert
                icon={<FontAwesomeIcon icon={["far", "circle-exclamation"]} />}
                title="Appeal Unavailable"
                color="red"
                variant="filled"
              >
                {"Invalid Appeal."}
              </Alert>
            </div>
          )}
        </div>
      </Layout>
    </LayoutProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const apolloClient = initializeApollo(req.headers.cookie!);
  const userId = parseInt(req.cookies.user);
  const courseId = parseInt(query.courseId as string);
  const appealId = parseInt(query.appealId as string);

  // TODO(BRYAN): Obtain the submission IDs from the backend
  const oldSubmissionId = 1;
  const newSubmissionId = 2;
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
      courseId,
      diffSubmissionsData,
    },
  };
};

export default AppealDetails;
