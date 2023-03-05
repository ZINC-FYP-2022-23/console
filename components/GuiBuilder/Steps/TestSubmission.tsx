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
import { Alert } from "../Diagnostics";
import LockedStep from "./LockedStep";

function TestSubmission() {
  const { user } = useZinc();

  const configId = useStoreState((state) => state.config.configId);
  const courseId = useStoreState((state) => state.config.courseId);
  const isAnyEdited = useStoreState((state) => state.config.isEdited.any);

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
    <div className="h-full mt-1 flex flex-col">
      <div className="ml-4 pb-2">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold leading-9 text-2xl text-gray-900">Your Submissions</h2>
          <SubmissionUploader assignmentConfigId={configId}>
            <button className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:shadow-outline-blue focus:border-cse-700 active:bg-cse-700 transition duration-150 ease-in-out">
              <FontAwesomeIcon className="mr-2" icon={["fad", "upload"]} />
              Submit
            </button>
          </SubmissionUploader>
        </div>
        {isAnyEdited && (
          <div className="w-max mt-4 drop-shadow-sm">
            <Alert severity="warning">
              You have unsaved changes. Please save them before testing your submissions.
            </Alert>
          </div>
        )}
      </div>
      <ScrollArea type="auto">
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
