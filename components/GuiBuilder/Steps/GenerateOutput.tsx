import { ReportSlideOver } from "@/components/Report";
import { SlideOver } from "@/components/SlideOver";
import { Submission } from "@/components/Submission";
import { SubmissionLoader } from "@/components/SubmissionLoader";
import SubmissionUploader from "@/components/SubmissionUploader";
import { useZinc } from "@/contexts/zinc";
import { SUBMISSION_DETAIL, SUBMISSION_SUBSCRIPTION } from "@/graphql/queries/user";
import { useStoreState } from "@/store/GuiBuilder";
import { AssignmentConfig, Course, Submission as SubmissionType, User } from "@/types/tables";
import { useQuery, useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea } from "@mantine/core";
import { ModalContent } from "pages/courses/[courseId]/assignments/[assignmentConfigId]/submissions";

/**
 * A step for generating the expected output of test cases in the `StdioTest` stage if this feature is enabled.
 */
function GenerateOutput() {
  const { user } = useZinc();

  const configId = useStoreState((state) => state.config.configId);
  const courseId = useStoreState((state) => state.config.courseId);

  const { data: submissionDetail } = useQuery<{
    user: User;
    course: Course;
    assignmentConfig: AssignmentConfig;
  }>(SUBMISSION_DETAIL, {
    variables: {
      userId: user,
      assignmentConfigId: configId,
      courseId,
    },
  });
  const { data, loading } = useSubscription<{ submissions: SubmissionType[] }>(SUBMISSION_SUBSCRIPTION, {
    variables: {
      userId: user,
      assignmentConfigId: configId,
    },
  });

  // Config ID should not be null by this point.
  if (configId === null) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="h-full px-4 py-3 flex flex-col bg-cool-gray-50 drop-shadow rounded-md">
        <div>
          <h2 className="font-semibold leading-8 text-2xl">Generate Expected Output</h2>
          <p className="text-xs text-gray-600">
            Generate the expected output of test cases for the &quot;Standard I/O Test &quot; stage
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <h3 className="flex items-center gap-3 font-semibold text-xl text-gray-700">
            <FontAwesomeIcon icon={["far", "circle-1"]} className="text-2xl" />
            <span>Submit Assignment Solution</span>
          </h3>
          <p className="text-sm text-gray-600">
            This assignment&apos;s solution will be used to generate the expected output of test cases.
          </p>
          <div className="self-start">
            <SubmissionUploader assignmentConfigId={configId}>
              <button className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:shadow-outline-blue focus:border-cse-700 active:bg-cse-700 transition duration-150 ease-in-out">
                <FontAwesomeIcon className="mr-2" icon={["fad", "upload"]} />
                Submit Assignment Solution
              </button>
            </SubmissionUploader>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <h3 className="flex items-center gap-3 font-semibold text-xl text-gray-700">
            <FontAwesomeIcon icon={["far", "circle-2"]} className="text-2xl" />
            <span>Confirmation</span>
          </h3>
          <ol className="ml-5 text-sm text-gray-600 list-decimal">
            <li>Wait for the Grader to process your solution and generate a grade report.</li>
            <li>
              In the grade report, go to the &quot;<span className="font-semibold">Run</span>&quot; stage to confirm
              that the expected output are generated correctly.
            </li>
          </ol>
        </div>
        <ScrollArea type="auto" className="mt-4 pb-2 flex-1 bg-gray-100 rounded-md">
          <ul className="w-full flex-1">
            {loading && <SubmissionLoader />}
            {data &&
              submissionDetail &&
              data.submissions
                .filter((submission) => submission.reports.length === 0 || submission.reports[0].is_test === true)
                .map((submission) => (
                  <Submission key={submission.id} submission={{ ...submission, user: submissionDetail.user }} />
                ))}
          </ul>
        </ScrollArea>
      </div>
      <SlideOver>
        <ReportSlideOver />
      </SlideOver>
      <ModalContent />
    </div>
  );
}

export default GenerateOutput;
