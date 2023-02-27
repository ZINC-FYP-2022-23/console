import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { useLayoutDispatch } from "../../contexts/layout";
import { UPDATE_ASSIGNMENT_CONFIG } from "../../graphql/mutations/user";
import { DateInput } from "@/components/Input";

const getLocalDate = (date: string) => {
  if (date) {
    return utcToZonedTime(`${date}Z`, "Asia/Hong_Kong");
  }
  return null;
};

export function ScheduleConfig({ schedules, onChange }) {
  const router = useRouter();
  const { assignmentConfigId } = router.query;
  const dispatch = useLayoutDispatch();
  const [updateConfig, { loading }] = useMutation(UPDATE_ASSIGNMENT_CONFIG);
  const today = new Date();

  const updateSchedule = async (schedule) => {
    try {
      await updateConfig({
        variables: {
          id: parseInt(assignmentConfigId as string, 10),
          update: schedule,
        },
      });
      dispatch({
        type: "showNotification",
        payload: {
          success: true,
          title: "Assignment Config Updated",
          message: "Changes to assignment schedule has been saved",
        },
      });
      onChange();
    } catch (error: any) {
      dispatch({ type: "showNotification", payload: { success: false, title: "Error", message: error.message } });
    }
  };

  return (
    <fieldset className="mt-6">
      <div className="flex justify-between">
        <div>
          <legend className="text-base leading-6 font-medium text-gray-900">Scheduling</legend>
          <p className="text-sm leading-5 text-gray-500">Date and Time settings for assignment.</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="showAt" className="block text-sm font-medium leading-5 text-gray-900">
            Announce
          </label>
          <div className="relative rounded-md shadow-sm">
            <DateInput
              id="showAt"
              selected={getLocalDate(schedules.showAt)}
              onChange={(date) =>
                date &&
                updateSchedule({
                  showAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                })
              }
              placeholderText="Assignment Announcement Date"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <label htmlFor="startCollectionAt" className="block text-sm font-medium leading-5 text-gray-900">
            Start Collection
          </label>
          <div className="relative rounded-md shadow-sm">
            <DateInput
              id="startCollectionAt"
              selected={getLocalDate(schedules.startCollectionAt)}
              onChange={(date) =>
                date &&
                updateSchedule({
                  startCollectionAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                })
              }
              maxDate={getLocalDate(schedules.dueAt)}
              placeholderText="Assignment Collection Start Date"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <label htmlFor="dueAt" className="block text-sm font-medium leading-5 text-gray-900">
            Due
          </label>
          <div className="relative rounded-md shadow-sm">
            <DateInput
              id="dueAt"
              selected={getLocalDate(schedules.dueAt)}
              onChange={(date) => {
                if (!date) return;
                if (date > getLocalDate(schedules.stopCollectionAt)!) {
                  updateSchedule({
                    dueAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                    stopCollectionAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                  });
                } else {
                  updateSchedule({
                    dueAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                  });
                }
              }}
              minDate={getLocalDate(schedules.startCollectionAt)}
              placeholderText="Assignment Grades Release Date"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <label htmlFor="stopCollectionAt" className="block text-sm font-medium leading-5 text-gray-900">
            Stop Collection
          </label>
          <div className="relative rounded-md shadow-sm">
            <DateInput
              id="stopCollectionAt"
              selected={getLocalDate(schedules.stopCollectionAt)}
              onChange={(date) =>
                date &&
                updateSchedule({
                  stopCollectionAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                })
              }
              minDate={getLocalDate(schedules.dueAt)}
              placeholderText="Assignment Collection Closing Date"
            />
          </div>
        </div>
        {!schedules.showImmediateScores && (
          <div className="mt-4 flex flex-col space-y-2">
            <label htmlFor="releaseGradeAt" className="block text-sm font-medium leading-5 text-gray-900">
              Release Grade
            </label>
            <div className="relative rounded-md shadow-sm">
              <DateInput
                id="releaseGradeAt"
                selected={getLocalDate(schedules.releaseGradeAt)}
                onChange={(date) =>
                  date &&
                  updateSchedule({
                    releaseGradeAt: zonedTimeToUtc(date, "Asia/Hong_Kong"),
                  })
                }
                placeholderText="Assignment Grades Release Date"
              />
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
}
