import { AppealResult } from "@/components/Appeal/AppealResult";
import RichTextEditor from "@/components/RichTextEditor";
import { LayoutProvider, useLayoutState } from "@/contexts/layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { Layout } from "@/layout";
import { Alert } from "@mantine/core";
import { AppealStatus, DisplayedAppealInfo } from "@/types";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import { DisplayMessageType, AppealLog } from "@/types/appeal";
import { Submission as SubmissionType } from "@/types/tables";
import { AppealLogMessage } from "@/components/Appeal/AppealLogMessage";
import { AppealTextMessage } from "@/components/Appeal/AppealTextMessage";
import { sort, transformToAppealLog } from "@/utils/appealUtils";
import { messageList, appealAttempts, changeLogList, courseId, appealInfo, fullScore } from "@/utils/dummyData";

type ActivityLogTabProps = {
  activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[];
};

/**
 * Return a component that shows the Activity Log under the Activity Log Tab to show all appeal messages and appeal logs
 * @param {
 *  | ((SubmissionType & { _type: "submission" })
 *  | (DisplayMessageType & { _type: "appealMessage" })
 *  | (AppealLog & { _type: "appealLog" }))[]
 * } activityLogList - A list of logs that may include appeal messages and appeal logs
 */
function ActivityLogTab({ activityLogList }: ActivityLogTabProps) {
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
              return <AppealLogMessage key={log.id} log={log} showButton={false} />;
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
      </div>
    </div>
  );
}

type CodeComparisonTabProps = {};

/**
 * Show the difference between new and old file submissions under the Code Comparison Tab by using ReactGhLikeDiff
 */
// TODO(ANSON): Complete the Code Comparison Tab
function CodeComparisonTab({}: CodeComparisonTabProps) {
  const { stdioTestCase } = useLayoutState();

  return (
    <div>
      <ReactGhLikeDiff
        options={{
          originalFileName: "Original Submission",
          updatedFileName: "New Submission",
          outputFormat: "side-by-side",
        }}
        // TODO(Bryan): Fix diffString error for Code Comparison Tab
        //diffString={stdioTestCase.diff.join("\n")}
      />
    </div>
  );
}

type AppealDetailsProps = {
  courseId: number;
  assignmentId: number;
  appealSubmitted: boolean;
  allowAccess: boolean;
  appealInfo: DisplayedAppealInfo | null;
  fullScore: number;
  activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[];
};

/**
 * Returns the entire Appeal Details page
 * @param {number}  courseId - The course ID that the appeal is related to
 * @param {number}  assignmentId - The assignment ID that the appeal is related to
 * @param {boolean} appealSubmitted - Is the appeal ID valid
 * @param {boolean} allowAccess - Is the student allowed to access the appeal
 * @param {DisplayedAppealInfo | null} appealInfo - The information of the appeal
 * @param {number}  fullScore - Maximum score of the assignment
 * @param {
 *  | ((SubmissionType & { _type: "submission" })
 *  | (DisplayMessageType & { _type: "appealMessage" })
 *  | (AppealLog & { _type: "appealLog" }))[]
 * } activityLogList - A list of log that includes appeal messages and appeal logs
 */
function AppealDetails({ courseId, appealInfo, fullScore, activityLogList }: AppealDetailsProps) {
  const [appealStatus, setAppealStatus] = useState(appealInfo?.status);

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
            <div>
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
                    {appealInfo.originalScore} / {fullScore}
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
              <div className="p-2 flex-1 space-y-2">
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
                      <ActivityLogTab activityLogList={activityLogList} />
                    </Tab.Panel>
                    {/* "Code Comparison" tab panel */}
                    <Tab.Panel>
                      <CodeComparisonTab />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
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

export const getServerSideProps: GetServerSideProps = async () => {
  // TODO(BRYAN): Retrieve the data from server once it's updated

  let log: AppealLog[] = transformToAppealLog({ appeals: appealAttempts, changeLog: changeLogList });

  let activityLogList: (
    | (SubmissionType & { _type: "submission" })
    | (DisplayMessageType & { _type: "appealMessage" })
    | (AppealLog & { _type: "appealLog" })
  )[] = sort({
    messages: messageList,
    appealLog: log,
  });

  return {
    props: { courseId, appealInfo, fullScore, messageList },
  };
};

export default AppealDetails;
