import AppealStatusBadge from "@components/Appeal/AppealStatusBadge";
import { LayoutProvider, useLayoutState } from "@contexts/layout";
import { Layout } from "@layout";
import { AppealStatus, Appeal } from "@types";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import React, { useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import { emit } from "process";
import { AppealResult } from "@components/Appeal/AppealResult";
import RichTextEditor from "@components/RichTextEditor";
import Button from "@components/Button";
import { Alert } from "@mantine/core";

// TODO(Bryan): Create a Appeal Detail Page

type IconProps = {
  name: String;
  type: "Student" | "Teaching Assistant";
};

function Icon({ name, type }: IconProps) {
  let backgroundColor: string;
  switch (type) {
    case "Student":
      backgroundColor = "bg-blue-700";
      break;
    case "Teaching Assistant":
      backgroundColor = "bg-red-800";
      break;
    default:
      backgroundColor = "bg-gray-800";
  }

  const css = "w-10 h-10 leading-10 rounded-full text-white font-bold text-lg text-center " + backgroundColor;
  return <div className={css}>{name.charAt(0)}</div>;
}

type Message = {
  id: number;
  name: String;
  type: "Student" | "Teaching Assistant";
  content: String;
  time: String;
};

function SingleMessage({ message }: { message: Message }) {
  const { name, type, time, content } = message;

  return (
    <div className="flex flex-row space-x-2">
      <Icon name={name} type={type} />
      <div className="overflow-x-auto">
        <div className="flex flex-row space-x-2">
          <p className="font-bold text-lg">{name}</p>
          <p className="text-gray-500">({type})</p>
          <p className="text-green-700">{time}</p>
        </div>
        <p>{message.content}</p>
      </div>
    </div>
  );
}

type MessagingTabProps = {
  messageList: Message[];
};

function MessagingTab({ messageList }: MessagingTabProps) {
  const [comments, setComments] = useState("");

  return (
    <div className="flex flex-col space-y-2">
      <div className="content-end mb-2">
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
      <div className="space-y-4">
        {messageList.map((message: Message) => (
          <div key={message.id}>
            <SingleMessage message={message} />
          </div>
        ))}
      </div>
    </div>
  );
}

type CodeComparisonTabProps = {};

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
        // TODO(Bryan): Fix diffString error
        //diffString={stdioTestCase.diff.join("\n")}
      />
    </div>
  );
}

type AppealDetailsProps = {
  courseId: number;
  appealInfo: Appeal | null;
  messageList: Message[];
};

function AppealDetails({ courseId, appealInfo, messageList }: AppealDetailsProps) {
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
                  <p className="font-medium">SID:</p>
                  <p className="col-span-2">{appealInfo.sid}</p>
                  <p className="font-medium">Email:</p>
                  <a href={`mailto:`} className="col-span-2 text-cse-400 underline hover:text-cse-700 transition">
                    {appealInfo.email}
                  </a>
                  <p className="font-medium">Original Score:</p>
                  <p className="col-span-2">{appealInfo.originalScore}</p>
                </div>
                {/* Appeal Status */}
                <div className="w-auto px-5 py-4 bg-white text-gray-700 shadow rounded-md">
                  <p className="font-medium flex justify-self-center text-lg bold">Appeal Status:</p>
                  <br />
                  <div className="col-span-2">
                    <AppealResult appealResult={appealInfo.status} />
                  </div>
                  <br />
                  <div className="flex-row w-full grid grid-cols-3 gap-x-5 place-items-center">
                    <a className="w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
                      <FontAwesomeIcon icon={["far", "check"]} />
                    </a>
                    <a className="w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
                      <FontAwesomeIcon icon={["far", "question"]} />
                    </a>
                    <a className="w-20 px-3 py-1.5 border text-center border-gray-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-gray-50 transition ease-in-out duration-150">
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
                      Messaging
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
                    {/* "Messaging" tab panel */}
                    <Tab.Panel>
                      <MessagingTab messageList={messageList} />
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
  const courseId = 3;
  //const appealInfo: Appeal | null = null;
  const appealInfo: Appeal | null = {
    id: 2,
    name: "Peter Chan",
    sid: "20512345",
    email: "peter@connect.ust.hk",
    status: AppealStatus.Pending,
    updatedAt: "Today LOL",
    originalScore: 70,
  };
  const messageList: Message[] = [
    {
      id: 1,
      name: "Lo Kwok Yan Bryan",
      type: "Student",
      time: "14 Nov 2022, 18:11",
      content: "Hi TA, I want to submit a grade appeal.",
    },
    {
      id: 2,
      name: "Gilbert Chan",
      type: "Teaching Assistant",
      time: "15 Nov 2022, 20:59",
      content: "Dear Bryan, Nice to Meet You!",
    },
  ];

  return {
    props: { courseId, appealInfo, messageList },
  };
};

export default AppealDetails;
