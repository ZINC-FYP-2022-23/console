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
import { ScrollArea, Tooltip } from "@mantine/core";
import { ModalContent } from "pages/courses/[courseId]/assignments/[assignmentConfigId]/submissions";
import LockedStep from "./LockedStep";

function TestSubmission() {
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

  if (configId === null) {
    return <LockedStep />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="pl-5 pr-8 py-3 mb-1 bg-gray-50 rounded-md shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold leading-8 text-2xl text-gray-900">Test Submission</h2>
            <p className="text-xs text-gray-600">Test the grading pipeline with dummy student submissions</p>
          </div>
          <div className="flex items-center gap-10">
            <Tooltip label="Grades the submission as if a student submitted it" position="bottom-end">
              <div>
                <SubmissionUploader assignmentConfigId={configId} isTest={false}>
                  <button className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:shadow-outline-blue focus:border-cse-700 active:bg-cse-700 transition duration-150 ease-in-out">
                    <FontAwesomeIcon className="mr-2" icon={["fad", "upload"]} />
                    Test Student Submission
                  </button>
                </SubmissionUploader>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <ScrollArea type="auto" className="pb-2">
        <ul className="w-full flex-1">
          {loading && <SubmissionLoader />}
          {data &&
            submissionDetail &&
            data.submissions.map((submission) => (
              <Submission key={submission.id} submission={{ ...submission, user: submissionDetail.user }} />
            ))}
        </ul>
      </ScrollArea>
      <SlideOver>
        <ReportSlideOver />
      </SlideOver>
      <ModalContent />
    </div>
  );
}

export default TestSubmission;
