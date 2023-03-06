import { useSubscription, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { SlideOver } from "../../../../../components/SlideOver";
import { Modal } from "../../../../../components/Modal";
import { LayoutProvider, useLayoutState } from "../../../../../contexts/layout";
import { Layout } from "../../../../../layout";
import { initializeApollo } from "../../../../../lib/apollo";
import { ReportSlideOver } from "../../../../../components/Report/index";
import { StdioTestDetailView } from "../../../../../components/Report/StdioTestStageReport";
import { ValgrindDetailView } from "../../../../../components/Report/ValgrindStageReport";
import { SUBMISSION_DETAIL, SUBMISSION_SUBSCRIPTION } from "../../../../../graphql/queries/user";
import { SubmissionLoader } from "../../../../../components/SubmissionLoader";
import { Submission } from "../../../../../components/Submission";
import { RegradingConfirmationDialog } from "../../../../../components/RegradingConfirmationDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SubmissionUploader from "@/components/SubmissionUploader";
import { SubmitAssignmentSolutionTooltip } from "@/components/GuiBuilder/Steps/TestSubmission";

export function ModalContent() {
  const { modalType } = useLayoutState();
  switch (modalType) {
    case "stdiotest":
      return (
        <Modal size="lg">
          <StdioTestDetailView />
        </Modal>
      );
    case "valgrind":
      return (
        <Modal size="lg">
          <ValgrindDetailView />
        </Modal>
      );
    case "regrading":
      return (
        <Modal size="regular">
          <RegradingConfirmationDialog />
        </Modal>
      );
    default:
      return <div className="hidden">Not Implememented</div>;
  }
}

function Assignment() {
  const router = useRouter();
  const { courseId, assignmentConfigId, userId } = router.query;
  const { data: submissionDetail, loading: loadingDetail } = useQuery(SUBMISSION_DETAIL, {
    variables: {
      userId: parseInt(userId as string, 10),
      assignmentConfigId: parseInt(assignmentConfigId as string, 10),
      courseId: parseInt(courseId as string, 10),
    },
  });
  const { data, loading } = useSubscription(SUBMISSION_SUBSCRIPTION, {
    variables: {
      userId: parseInt(userId as string, 10),
      assignmentConfigId: parseInt(assignmentConfigId as string, 10),
    },
  });

  return (
    <LayoutProvider>
      <Layout title="Submission History">
        <main className="flex-1 flex flex-col bg-gray-200 overflow-y-auto mb-6">
          <div className="px-6 mt-6">
            <div>
              <nav className="sm:hidden">
                <Link href="/">
                  <a className="flex items-center text-sm leading-5 font-medium text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">
                    <svg
                      className="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back
                  </a>
                </Link>
              </nav>
              <nav className="hidden sm:flex items-center text-sm leading-5 font-medium">
                <Link href={`/courses/${courseId}`}>
                  <a className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">
                    {!loadingDetail && submissionDetail.course.code}
                  </a>
                </Link>
                <svg
                  className="flex-shrink-0 mx-2 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link href={`/courses/${courseId}`}>
                  <a className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">
                    {!loadingDetail && submissionDetail.assignmentConfig.assignment.name}
                  </a>
                </Link>
                <svg
                  className="flex-shrink-0 mx-2 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link href={`/courses/${courseId}/assignments/${assignmentConfigId}/submissions?userId=${userId}`}>
                  <a className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">Submissions</a>
                </Link>
              </nav>
            </div>
            <div className="mt-2 md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
                  {!loadingDetail && submissionDetail.user.name}&apos;s Submissions
                </h2>
              </div>
              <div className="flex items-center gap-8">
                {/* Submit Assignment Solution */}
                <div className="flex items-center gap-1">
                  <SubmissionUploader assignmentConfigId={parseInt(assignmentConfigId as string)}>
                    <button className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:shadow-outline-blue focus:border-purple-700 active:bg-purple-700 transition duration-150 ease-in-out">
                      <FontAwesomeIcon className="mr-2" icon={["fad", "upload"]} />
                      Submit Assignment Solution
                    </button>
                  </SubmissionUploader>
                  <SubmitAssignmentSolutionTooltip />
                </div>
                {/* Test Student Submission */}
                <SubmissionUploader assignmentConfigId={parseInt(assignmentConfigId as string)} isTest={false}>
                  <button className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:shadow-outline-blue focus:border-cse-700 active:bg-cse-700 transition duration-150 ease-in-out">
                    <FontAwesomeIcon className="mr-2" icon={["fad", "upload"]} />
                    Test Student Submission
                  </button>
                </SubmissionUploader>
              </div>
            </div>
          </div>
          <ul className="w-full">
            {loading && <SubmissionLoader />}
            {data &&
              submissionDetail &&
              data.submissions.map((submission) => (
                <Submission key={submission.id} submission={{ ...submission, user: submissionDetail.user }} />
              ))}
          </ul>
        </main>
      </Layout>
      <SlideOver>
        <ReportSlideOver />
      </SlideOver>
      <ModalContent />
    </LayoutProvider>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(ctx.req.headers.cookie);
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}

export default Assignment;
