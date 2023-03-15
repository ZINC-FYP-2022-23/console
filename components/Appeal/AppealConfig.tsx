import { useMutation } from "@apollo/client";
import { Checkbox, DateInput } from "components/Input";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { useRouter } from "next/router";
import { useLayoutDispatch } from "../../contexts/layout";
import { UPDATE_ASSIGNMENT_CONFIG } from "../../graphql/mutations/user";

const getLocalDate = (date: string) => {
  if (date) {
    return utcToZonedTime(`${date}Z`, "Asia/Hong_Kong");
  }
  return null;
};

type AppealConfigType = {
  stopCollectionAt?: Date;
  isAppealAllowed: boolean;
  appealLimits?: Number | null;
  appealDueAt?: Date;
  isAppealStudentReplyAllowed?: boolean;
};

interface AppealConfigProps {
  assignmentConfig;
  setAssignmentConfig?; // Used when creating new config
  onChange?; // Used when updating config
}

export function AppealConfig({ assignmentConfig, setAssignmentConfig, onChange }: AppealConfigProps) {
  const router = useRouter();
  const { assignmentConfigId } = router.query;
  const dispatch = useLayoutDispatch();
  const [updateConfig] = useMutation(UPDATE_ASSIGNMENT_CONFIG);

  const updateAppealConfig = async (appealConfig) => {
    try {
      await updateConfig({
        variables: {
          id: parseInt(assignmentConfigId as string, 10),
          update: appealConfig,
        },
      });
      dispatch({
        type: "showNotification",
        payload: {
          success: true,
          title: "Assignment Config Updated",
          message: "Changes to grading appeal policy has been saved",
        },
      });
      onChange();
    } catch (error: any) {
      dispatch({ type: "showNotification", payload: { success: false, title: "Error", message: error.message } });
    }
  };

  return (
    <fieldset>
      <legend className="mt-10 text-base leading-6 font-medium text-gray-900">Grade Appeal-related</legend>
      {/* isAppealAllowed */}
      <div className="mt-4 flex items-start">
        <div className="flex items-center h-5">
          <Checkbox
            checked={assignmentConfig.isAppealAllowed}
            onChange={(e) => {
              if (setAssignmentConfig) setAssignmentConfig({ ...assignmentConfig, isAppealAllowed: e.target.checked });
              else updateAppealConfig({ isAppealAllowed: e.target.checked });
            }}
            id="isAppealAllowed"
          />
        </div>
        <div className="ml-3 text-sm leading-5">
          <label htmlFor="isAppealAllowed" className="font-medium text-gray-700">
            Allow Grade Appeal
          </label>
          <p className="text-gray-500">Allow students to submit grade appeals after the grade is released.</p>
        </div>
      </div>
      {/* Only show the fields related to appeal if `isAppealAllowed` is checked */}
      {assignmentConfig.isAppealAllowed && (
        <div>
          {/* appealLimits */}
          <div className="mt-4 flex justify-between items-center">
            <label htmlFor="appealLimits" className="block text-sm font-medium leading-5 text-gray-700">
              Appeal Limits
            </label>
            <input
              id="appealLimits"
              type="number"
              onChange={(e) => {
                if (setAssignmentConfig)
                  setAssignmentConfig({
                    ...assignmentConfig,
                    appealLimits: parseInt(e.target.value, 10) || null,
                  });
                else updateAppealConfig({ appealLimits: parseInt(e.target.value, 10) || null });
              }}
              placeholder="Unlimited"
              className="mt-1 form-input block w-1/2 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
            />
          </div>
          {/* appealDueAt */}
          <div className="mt-4 flex flex-col space-y-2">
            <label htmlFor="appealDueAt" className="block text-sm font-medium leading-5 text-gray-900">
              Stop Appeal Collection
            </label>
            <div className="relative rounded-md shadow-sm">
              <DateInput
                id="appealDueAt"
                selected={getLocalDate(assignmentConfig.appealDueAt)}
                onChange={(date) => {
                  if (setAssignmentConfig)
                    setAssignmentConfig({ ...assignmentConfig, appealDueAt: zonedTimeToUtc(date!, "Asia/Hong_Kong") });
                  else if (date) updateAppealConfig({ appealDueAt: zonedTimeToUtc(date!, "Asia/Hong_Kong") });
                }}
                minDate={assignmentConfig.stopCollectionAt}
                placeholderText="Appeal Submission Closing Date"
              />
            </div>
          </div>
          {/* isAppealStudentReplyAllowed */}
          <div className="mt-4 flex items-start">
            <div className="flex items-center h-5">
              <Checkbox
                checked={assignmentConfig.isAppealStudentReplyAllowed}
                onChange={(e) => {
                  if (setAssignmentConfig)
                    setAssignmentConfig({ ...assignmentConfig, isAppealStudentReplyAllowed: e.target.checked });
                  else updateAppealConfig({ isAppealStudentReplyAllowed: e.target.checked });
                }}
                id="isAppealStudentReplyAllowed"
              />
            </div>
            <div className="ml-3 text-sm leading-5">
              <label htmlFor="isAppealStudentReplyAllowed" className="font-medium text-gray-700">
                Allow Student Reply
              </label>
              <p className="text-gray-500">Allow students to send reply messages after submitting an appeal.</p>
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
